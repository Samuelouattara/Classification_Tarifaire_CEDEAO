#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Parser TEC CEDEAO complet pour MySQL
Traite tous les chapitres et codes tarifaires
"""

import mysql.connector
import re
import json
import sys
from datetime import datetime
from typing import Dict, List, Tuple, Optional

class TECParserComplete:
    def __init__(self, host='localhost', port=4240, user='root', password='root', database='douane'):
        """Initialise la connexion MySQL"""
        self.config = {
            'host': host,
            'port': port,
            'user': user,
            'password': password,
            'database': database,
            'charset': 'utf8mb4',
            'collation': 'utf8mb4_unicode_ci'
        }
        self.connection = None
        self.cursor = None
        
    def connect_db(self):
        """Établit la connexion MySQL"""
        try:
            self.connection = mysql.connector.connect(**self.config)
            self.cursor = self.connection.cursor(dictionary=True)
            print("Connexion MySQL etablie")
            return True
        except mysql.connector.Error as e:
            print(f"Erreur de connexion MySQL: {e}")
            return False
    
    def close_db(self):
        """Ferme la connexion MySQL"""
        if self.cursor:
            self.cursor.close()
        if self.connection:
            self.connection.close()
        print("Connexion MySQL fermee")
    
    def create_tables(self):
        """Crée les tables CEDEAO si elles n'existent pas"""
        try:
            # Lire le fichier SQL des tables
            with open('cedeo-mysql-tables.sql', 'r', encoding='utf-8') as f:
                sql_content = f.read()
            
            # Exécuter les commandes SQL
            commands = sql_content.split(';')
            for command in commands:
                command = command.strip()
                if command and not command.startswith('--'):
                    self.cursor.execute(command)
            
            self.connection.commit()
            print("Tables CEDEAO creees/verifiees")
            return True
        except Exception as e:
            print(f"Erreur creation tables: {e}")
            return False
    
    def parse_tec_file(self, filename: str):
        """Parse le fichier TEC CEDEAO complet"""
        try:
            with open(filename, 'r', encoding='utf-8') as f:
                content = f.read()
            
            print(f"Fichier TEC lu: {len(content)} caracteres")
            
            # Nettoyer les tables existantes
            self.cursor.execute("DELETE FROM cedeo_mots_cles")
            self.cursor.execute("DELETE FROM cedeo_cache_classifications")
            self.cursor.execute("DELETE FROM cedeo_codes_tarifaires")
            self.cursor.execute("DELETE FROM cedeo_chapitres")
            self.cursor.execute("DELETE FROM cedeo_sections")
            self.connection.commit()
            print("Tables nettoyees")
            
            # Parser ligne par ligne
            lines = content.split('\n')
            current_section = None
            current_section_title = ""
            current_chapter = None
            current_chapter_title = ""
            
            sections_count = 0
            chapters_count = 0
            codes_count = 0
            
            for i, line in enumerate(lines):
                line = line.strip()
                if not line:
                    continue
                
                # Détecter les sections
                section_match = re.match(r'^SECTION\s+([IVX]+)\s*$', line, re.IGNORECASE)
                if section_match:
                    current_section = section_match.group(1)
                    current_section_title = ""
                    sections_count += 1
                    print(f"Section {current_section} trouvee")
                    continue
                
                # Détecter le titre de section (ligne après SECTION)
                if current_section and not current_section_title and line and not line.startswith('Notes de Section'):
                    current_section_title = line
                    self.insert_section(current_section, current_section_title)
                    continue
                
                # Détecter les chapitres
                chapter_match = re.match(r'^(\d{2}\.\d{2})\s+(.+)$', line)
                if chapter_match:
                    chapter_code = chapter_match.group(1)
                    chapter_title = chapter_match.group(2).strip()
                    
                    # Vérifier que ce n'est pas un code tarifaire
                    if not re.match(r'^\d{4}\.\d{2}', line):
                        current_chapter = chapter_code
                        current_chapter_title = chapter_title
                        if current_section:
                            self.insert_chapter(current_chapter, current_chapter_title, current_section)
                            chapters_count += 1
                            print(f"  Chapitre {chapter_code}: {chapter_title[:50]}...")
                        continue
                
                # Détecter les codes tarifaires
                code_match = re.match(r'^\s*(\d{4}\.\d{2}\.\d{2}\.\d{2})\s*[-–]\s*(.+)$', line)
                if code_match and current_chapter and current_section:
                    code = code_match.group(1)
                    description = code_match.group(2).strip()
                    
                    # Nettoyer la description
                    description = re.sub(r'\s+kg\s+\d+\s+\d+\s*$', '', description)
                    description = re.sub(r'\s+kg\s+\d+\s*$', '', description)
                    description = re.sub(r'\s+\d+\s+\d+\s*$', '', description)
                    description = description.strip()
                    
                    # Chercher le taux sur la ligne suivante
                    taux = 15.00
                    if i + 1 < len(lines):
                        next_line = lines[i + 1].strip()
                        taux_match = re.match(r'^\s*u\s+(\d+)\s+\d+\s*$', next_line)
                        if taux_match:
                            taux = float(taux_match.group(1))
                    
                    self.insert_tariff_code(code, description, current_chapter, current_section, taux)
                    codes_count += 1
                    continue
            
            # Générer les mots-clés
            self.generate_keywords()
            
            self.connection.commit()
            print(f"Parsing termine: {sections_count} sections, {chapters_count} chapitres, {codes_count} codes tarifaires")
            return codes_count
            
        except Exception as e:
            print(f"Erreur parsing: {e}")
            return 0
    
    def insert_section(self, code: str, title: str):
        """Insère une section dans la base"""
        try:
            taux_moyen = self.calculate_section_average_rate(code)
            self.cursor.execute("""
                INSERT INTO cedeo_sections (code_section, titre_section, description_section, taux_moyen)
                VALUES (%s, %s, %s, %s)
            """, (code, title, title, taux_moyen))
        except Exception as e:
            print(f"Erreur insertion section {code}: {e}")
    
    def calculate_section_average_rate(self, section_code: str) -> float:
        """Calcule le taux moyen approximatif pour une section"""
        taux_par_section = {
            'I': 10.50, 'II': 8.75, 'III': 12.00, 'IV': 15.25, 'V': 5.50,
            'VI': 18.75, 'VII': 14.50, 'VIII': 16.25, 'IX': 11.75, 'X': 13.50,
            'XI': 17.25, 'XII': 19.50, 'XIII': 9.25, 'XIV': 25.00, 'XV': 12.75,
            'XVI': 22.50, 'XVII': 20.75, 'XVIII': 16.50, 'XIX': 35.00, 'XX': 15.75, 'XXI': 30.00
        }
        return taux_par_section.get(section_code, 15.00)
    
    def insert_chapter(self, code: str, title: str, section_code: str):
        """Insère un chapitre dans la base"""
        try:
            self.cursor.execute("""
                INSERT INTO cedeo_chapitres (code_chapitre, titre_chapitre, description_chapitre, code_section)
                VALUES (%s, %s, %s, %s)
            """, (code, title, title, section_code))
        except Exception as e:
            print(f"Erreur insertion chapitre {code}: {e}")
    
    def insert_tariff_code(self, code: str, description: str, chapter: str, section: str, taux: float):
        """Insère un code tarifaire dans la base"""
        try:
            self.cursor.execute("""
                INSERT INTO cedeo_codes_tarifaires 
                (code_tarifaire, description_produit, code_chapitre, code_section, taux_imposition)
                VALUES (%s, %s, %s, %s, %s)
            """, (code, description, chapter, section, taux))
        except Exception as e:
            print(f"Erreur insertion code {code}: {e}")
    
    def generate_keywords(self):
        """Génère les mots-clés pour la recherche"""
        try:
            self.cursor.execute("SELECT code_tarifaire, description_produit FROM cedeo_codes_tarifaires")
            codes = self.cursor.fetchall()
            
            keywords_count = 0
            for code_data in codes:
                keywords = self.extract_keywords(code_data['description_produit'])
                for keyword, poids in keywords.items():
                    try:
                        self.cursor.execute("""
                            INSERT INTO cedeo_mots_cles (mot_cle, code_tarifaire, poids_recherche)
                            VALUES (%s, %s, %s)
                        """, (keyword, code_data['code_tarifaire'], poids))
                        keywords_count += 1
                    except:
                        pass  # Ignorer les doublons
            
            print(f"{keywords_count} mots-cles generes")
            
        except Exception as e:
            print(f"Erreur generation mots-cles: {e}")
    
    def extract_keywords(self, text: str) -> Dict[str, int]:
        """Extrait les mots-clés d'un texte"""
        text = text.lower()
        text = re.sub(r'[^\w\s]', ' ', text)
        
        stop_words = {'et', 'ou', 'de', 'du', 'des', 'le', 'la', 'les', 'un', 'une', 'pour', 'avec', 'sans', 'par'}
        
        words = text.split()
        keywords = {}
        
        for word in words:
            if len(word) > 2 and word not in stop_words:
                poids = min(len(word), 5)
                keywords[word] = max(keywords.get(word, 0), poids)
        
        return keywords
    
    def get_statistics(self) -> Dict:
        """Retourne les statistiques de la base"""
        try:
            stats = {}
            
            self.cursor.execute("SELECT COUNT(*) as count FROM cedeo_sections")
            stats['sections'] = self.cursor.fetchone()['count']
            
            self.cursor.execute("SELECT COUNT(*) as count FROM cedeo_chapitres")
            stats['chapitres'] = self.cursor.fetchone()['count']
            
            self.cursor.execute("SELECT COUNT(*) as count FROM cedeo_codes_tarifaires")
            stats['codes_tarifaires'] = self.cursor.fetchone()['count']
            
            self.cursor.execute("SELECT COUNT(*) as count FROM cedeo_mots_cles")
            stats['mots_cles'] = self.cursor.fetchone()['count']
            
            return stats
            
        except Exception as e:
            print(f"Erreur statistiques: {e}")
            return {}
    
    def export_to_json(self, filename: str):
        """Exporte les données vers JSON"""
        try:
            self.cursor.execute("""
                SELECT 
                    ct.code_tarifaire,
                    ct.description_produit,
                    ct.taux_imposition,
                    c.code_chapitre,
                    c.titre_chapitre,
                    s.code_section,
                    s.titre_section
                FROM cedeo_codes_tarifaires ct
                JOIN cedeo_chapitres c ON ct.code_chapitre = c.code_chapitre
                JOIN cedeo_sections s ON ct.code_section = s.code_section
                ORDER BY ct.code_tarifaire
            """)
            
            data = self.cursor.fetchall()
            
            # Convertir les Decimal en float pour la sérialisation JSON
            for item in data:
                if 'taux_imposition' in item and hasattr(item['taux_imposition'], '__float__'):
                    item['taux_imposition'] = float(item['taux_imposition'])
                if 'taux_section' in item and hasattr(item['taux_section'], '__float__'):
                    item['taux_section'] = float(item['taux_section'])
            
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            
            print(f"Export JSON: {filename}")
            
        except Exception as e:
            print(f"Erreur export JSON: {e}")

def main():
    """Fonction principale"""
    print("Parser TEC CEDEAO complet pour MySQL")
    print("=" * 50)
    
    parser = TECParserComplete(
        host='localhost',
        port=4240,
        user='root',
        password='root',
        database='douane'
    )
    
    if not parser.connect_db():
        sys.exit(1)
    
    try:
        if not parser.create_tables():
            sys.exit(1)
        
        filename = 'MON-TEC-CEDEAO-SH-2022-FREN-09-04-2024.txt'
        total_codes = parser.parse_tec_file(filename)
        
        if total_codes > 0:
            stats = parser.get_statistics()
            print("\nStatistiques:")
            for key, value in stats.items():
                print(f"  {key}: {value}")
            
            parser.export_to_json('cedeo_rules_complete.json')
            
            print(f"\nParsing termine avec succes!")
            print(f"Fichier JSON cree: cedeo_rules_complete.json")
        else:
            print("Aucun code tarifaire trouve")
            
    except Exception as e:
        print(f"Erreur: {e}")
    finally:
        parser.close_db()

if __name__ == "__main__":
    main()
