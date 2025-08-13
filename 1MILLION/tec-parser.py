#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Parser TEC CEDEAO - Extraction Complète des Règles
==================================================

Ce script parse le fichier MON-TEC-CEDEAO-SH-2022-FREN-09-04-2024.txt
et extrait toutes les règles de classification avec leurs taux de taxe.
"""

import re
import sqlite3
import json
from datetime import datetime
from typing import Dict, List, Tuple, Optional

class TECParser:
    def __init__(self, db_path: str = "cedeo_rules.db"):
        self.db_path = db_path
        self.conn = None
        self.cursor = None
        
    def init_database(self):
        """Initialise la base de données avec les tables nécessaires"""
        self.conn = sqlite3.connect(self.db_path)
        self.cursor = self.conn.cursor()
        
        # Table principale des codes tarifaires
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS tariff_codes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                tariff_code TEXT UNIQUE NOT NULL,
                chapter TEXT NOT NULL,
                heading TEXT NOT NULL,
                subheading TEXT,
                description TEXT NOT NULL,
                tax_rate REAL NOT NULL,
                unit TEXT,
                section TEXT,
                keywords TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Table des mots-clés pour recherche rapide
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS keywords (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                keyword TEXT NOT NULL,
                tariff_code TEXT NOT NULL,
                weight REAL DEFAULT 1.0,
                FOREIGN KEY (tariff_code) REFERENCES tariff_codes (tariff_code)
            )
        ''')
        
        # Table des sections
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS sections (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                section_code TEXT UNIQUE NOT NULL,
                section_name TEXT NOT NULL,
                description TEXT
            )
        ''')
        
        # Index pour performance
        self.cursor.execute('CREATE INDEX IF NOT EXISTS idx_tariff_code ON tariff_codes(tariff_code)')
        self.cursor.execute('CREATE INDEX IF NOT EXISTS idx_keywords ON keywords(keyword)')
        self.cursor.execute('CREATE INDEX IF NOT EXISTS idx_tax_rate ON tariff_codes(tax_rate)')
        
        self.conn.commit()
        
    def parse_tec_file(self, file_path: str):
        """Parse le fichier TEC CEDEAO complet"""
        print(f"🔍 Début du parsing du fichier: {file_path}")
        
        current_section = None
        current_chapter = None
        current_heading = None
        
        with open(file_path, 'r', encoding='utf-8') as file:
            lines = file.readlines()
            
        total_lines = len(lines)
        processed = 0
        
        for line_num, line in enumerate(lines, 1):
            line = line.strip()
            
            # Afficher le progrès
            if line_num % 1000 == 0:
                progress = (line_num / total_lines) * 100
                print(f"📊 Progression: {progress:.1f}% ({line_num}/{total_lines})")
            
            # Détecter les sections (ex: "SECTION I")
            section_match = re.match(r'^SECTION\s+([IVX]+)\s*[-–]\s*(.+)$', line, re.IGNORECASE)
            if section_match:
                section_code = section_match.group(1)
                section_name = section_match.group(2).strip()
                current_section = section_code
                self.insert_section(section_code, section_name)
                continue
            
            # Détecter les chapitres (ex: "01.01")
            chapter_match = re.match(r'^(\d{2})\.(\d{2})\s+(\d{4})\.(\d{2})\.(\d{2})\.(\d{2})\s+(.+)$', line)
            if chapter_match:
                chapter = f"{chapter_match.group(1)}.{chapter_match.group(2)}"
                tariff_code = f"{chapter_match.group(3)}{chapter_match.group(4)}{chapter_match.group(5)}{chapter_match.group(6)}"
                description = chapter_match.group(7).strip()
                current_chapter = chapter
                current_heading = tariff_code[:6]
                
                # Extraire le taux de taxe (dernier nombre dans la ligne)
                tax_rate_match = re.search(r'(\d+(?:\.\d+)?)\s*$', line)
                tax_rate = float(tax_rate_match.group(1)) if tax_rate_match else 20.0
                
                # Extraire l'unité
                unit_match = re.search(r'\s+(kg|u|l|m|m2|m3|paire|douzaine|centaine|millier|tonne)\s+', line)
                unit = unit_match.group(1) if unit_match else 'u'
                
                self.insert_tariff_code(
                    tariff_code=tariff_code,
                    chapter=chapter,
                    heading=current_heading,
                    description=description,
                    tax_rate=tax_rate,
                    unit=unit,
                    section=current_section
                )
                
                # Extraire les mots-clés de la description
                keywords = self.extract_keywords(description)
                for keyword in keywords:
                    self.insert_keyword(keyword, tariff_code)
                
                processed += 1
                continue
            
            # Détecter les sous-positions (lignes avec tirets)
            if line.startswith('--') or line.startswith('-'):
                # C'est une sous-position, traiter comme une ligne de chapitre
                subheading_match = re.match(r'^[-–]+\s*(\d{4})\.(\d{2})\.(\d{2})\.(\d{2})\s+(.+)$', line)
                if subheading_match:
                    tariff_code = f"{subheading_match.group(1)}{subheading_match.group(2)}{subheading_match.group(3)}{subheading_match.group(4)}"
                    description = subheading_match.group(5).strip()
                    
                    # Extraire le taux de taxe
                    tax_rate_match = re.search(r'(\d+(?:\.\d+)?)\s*$', line)
                    tax_rate = float(tax_rate_match.group(1)) if tax_rate_match else 20.0
                    
                    # Extraire l'unité
                    unit_match = re.search(r'\s+(kg|u|l|m|m2|m3|paire|douzaine|centaine|millier|tonne)\s+', line)
                    unit = unit_match.group(1) if unit_match else 'u'
                    
                    self.insert_tariff_code(
                        tariff_code=tariff_code,
                        chapter=current_chapter,
                        heading=current_heading,
                        description=description,
                        tax_rate=tax_rate,
                        unit=unit,
                        section=current_section
                    )
                    
                    # Extraire les mots-clés
                    keywords = self.extract_keywords(description)
                    for keyword in keywords:
                        self.insert_keyword(keyword, tariff_code)
                    
                    processed += 1
        
        print(f"✅ Parsing terminé! {processed} codes tarifaires traités")
        self.conn.commit()
        
    def extract_keywords(self, description: str) -> List[str]:
        """Extrait les mots-clés pertinents d'une description"""
        # Nettoyer la description
        clean_desc = re.sub(r'[^\w\s]', ' ', description.lower())
        
        # Mots à ignorer
        stop_words = {
            'et', 'ou', 'de', 'des', 'du', 'le', 'la', 'les', 'un', 'une', 'autre', 'autres',
            'avec', 'sans', 'pour', 'par', 'dans', 'sur', 'sous', 'entre', 'contre',
            'y', 'compris', 'non', 'ne', 'pas', 'plus', 'moins', 'très', 'trop',
            'frais', 'réfrigérés', 'congelés', 'séchés', 'salés', 'fumés'
        }
        
        # Extraire les mots significatifs
        words = clean_desc.split()
        keywords = []
        
        for word in words:
            if len(word) > 2 and word not in stop_words:
                keywords.append(word)
        
        return keywords[:10]  # Limiter à 10 mots-clés par description
        
    def insert_section(self, section_code: str, section_name: str):
        """Insère une section dans la base de données"""
        try:
            self.cursor.execute('''
                INSERT OR REPLACE INTO sections (section_code, section_name)
                VALUES (?, ?)
            ''', (section_code, section_name))
        except Exception as e:
            print(f"⚠️ Erreur insertion section {section_code}: {e}")
            
    def insert_tariff_code(self, tariff_code: str, chapter: str, heading: str, 
                          description: str, tax_rate: float, unit: str, section: str):
        """Insère un code tarifaire dans la base de données"""
        try:
            self.cursor.execute('''
                INSERT OR REPLACE INTO tariff_codes 
                (tariff_code, chapter, heading, description, tax_rate, unit, section)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (tariff_code, chapter, heading, description, tax_rate, unit, section))
        except Exception as e:
            print(f"⚠️ Erreur insertion code {tariff_code}: {e}")
            
    def insert_keyword(self, keyword: str, tariff_code: str):
        """Insère un mot-clé dans la base de données"""
        try:
            self.cursor.execute('''
                INSERT OR IGNORE INTO keywords (keyword, tariff_code)
                VALUES (?, ?)
            ''', (keyword, tariff_code))
        except Exception as e:
            print(f"⚠️ Erreur insertion mot-clé {keyword}: {e}")
            
    def get_statistics(self) -> Dict:
        """Retourne les statistiques de la base de données"""
        stats = {}
        
        # Nombre total de codes tarifaires
        self.cursor.execute('SELECT COUNT(*) FROM tariff_codes')
        stats['total_codes'] = self.cursor.fetchone()[0]
        
        # Nombre de sections
        self.cursor.execute('SELECT COUNT(*) FROM sections')
        stats['total_sections'] = self.cursor.fetchone()[0]
        
        # Nombre de mots-clés
        self.cursor.execute('SELECT COUNT(*) FROM keywords')
        stats['total_keywords'] = self.cursor.fetchone()[0]
        
        # Taux de taxe min/max
        self.cursor.execute('SELECT MIN(tax_rate), MAX(tax_rate) FROM tariff_codes')
        min_rate, max_rate = self.cursor.fetchone()
        stats['tax_rate_range'] = {'min': min_rate, 'max': max_rate}
        
        return stats
        
    def export_to_json(self, output_file: str = "cedeo_rules.json"):
        """Exporte toutes les règles en JSON pour utilisation dans le bot"""
        print(f"📤 Export vers {output_file}...")
        
        # Récupérer tous les codes tarifaires avec leurs mots-clés
        self.cursor.execute('''
            SELECT tc.tariff_code, tc.chapter, tc.heading, tc.description, 
                   tc.tax_rate, tc.unit, tc.section, tc.keywords
            FROM tariff_codes tc
            ORDER BY tc.tariff_code
        ''')
        
        rules = []
        for row in self.cursor.fetchall():
            tariff_code, chapter, heading, description, tax_rate, unit, section, keywords = row
            
            # Récupérer les mots-clés pour ce code
            self.cursor.execute('''
                SELECT keyword FROM keywords 
                WHERE tariff_code = ? 
                ORDER BY weight DESC
            ''', (tariff_code,))
            
            keyword_list = [kw[0] for kw in self.cursor.fetchall()]
            
            rule = {
                'tariff_code': tariff_code,
                'chapter': chapter,
                'heading': heading,
                'description': description,
                'tax_rate': tax_rate,
                'unit': unit,
                'section': section,
                'keywords': keyword_list
            }
            rules.append(rule)
        
        # Sauvegarder en JSON
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump({
                'metadata': {
                    'source': 'MON-TEC-CEDEAO-SH-2022-FREN-09-04-2024.txt',
                    'parsed_at': datetime.now().isoformat(),
                    'total_rules': len(rules)
                },
                'rules': rules
            }, f, ensure_ascii=False, indent=2)
        
        print(f"✅ Export terminé: {len(rules)} règles exportées")
        
    def close(self):
        """Ferme la connexion à la base de données"""
        if self.conn:
            self.conn.close()

def main():
    """Fonction principale"""
    print("🚀 Parser TEC CEDEAO - Extraction Complète des Règles")
    print("=" * 60)
    
    # Initialiser le parser
    parser = TECParser()
    parser.init_database()
    
    # Parser le fichier TEC
    tec_file = "MON-TEC-CEDEAO-SH-2022-FREN-09-04-2024.txt"
    parser.parse_tec_file(tec_file)
    
    # Afficher les statistiques
    stats = parser.get_statistics()
    print("\n📊 Statistiques:")
    print(f"   - Codes tarifaires: {stats['total_codes']}")
    print(f"   - Sections: {stats['total_sections']}")
    print(f"   - Mots-clés: {stats['total_keywords']}")
    print(f"   - Taux de taxe: {stats['tax_rate_range']['min']}% - {stats['tax_rate_range']['max']}%")
    
    # Exporter en JSON
    parser.export_to_json()
    
    # Fermer la connexion
    parser.close()
    
    print("\n✅ Parsing et export terminés avec succès!")
    print("📁 Fichiers créés:")
    print("   - cedeo_rules.db (base de données SQLite)")
    print("   - cedeo_rules.json (export JSON pour le bot)")

if __name__ == "__main__":
    main()
