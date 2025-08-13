#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Parser TEC CEDEAO pour MySQL
Analyse le fichier MON-TEC-CEDEAO-SH-2022-FREN-09-04-2024.txt
et stocke les règles dans la base MySQL existante
"""

import mysql.connector
import re
import json
import sys
from datetime import datetime
from typing import Dict, List, Tuple, Optional

class TECParserMySQL:
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
            print(f"❌ Erreur de connexion MySQL: {e}")
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
            print(f"❌ Erreur création tables: {e}")
            return False
    
    def parse_tec_file(self, filename: str):
        """Parse le fichier TEC CEDEAO"""
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
            
            # Parser les sections
            sections = self.extract_sections(content)
            print(f"{len(sections)} sections trouvees")
            
            # Parser les chapitres et codes tarifaires
            total_codes = 0
            for section_code, section_data in sections.items():
                self.insert_section(section_code, section_data)
                codes_in_section = self.parse_section_content(section_data['content'], section_code)
                total_codes += codes_in_section
                print(f"  Section {section_code}: {codes_in_section} codes")
            
            # Générer les mots-clés
            self.generate_keywords()
            
            self.connection.commit()
            print(f"Parsing termine: {total_codes} codes tarifaires")
            return total_codes
            
        except Exception as e:
            print(f"❌ Erreur parsing: {e}")
            return 0
    
    def extract_sections(self, content: str) -> Dict:
        """Extrait les sections du contenu"""
        sections = {}
        current_section = None
        current_content = []
        
        lines = content.split('\n')
        for line in lines:
            # Détecter les sections (format: SECTION I, SECTION II, etc.)
            section_match = re.match(r'^SECTION\s+([IVX]+)\s*$', line.strip(), re.IGNORECASE)
            if section_match:
                if current_section:
                    sections[current_section] = {
                        'title': current_title,
                        'content': '\n'.join(current_content)
                    }
                
                current_section = section_match.group(1)
                current_title = ""
                current_content = []
            elif current_section:
                # Si c'est la première ligne après SECTION et qu'elle n'est pas vide, c'est le titre
                if not current_title and line.strip() and not line.strip().startswith('Notes de Section'):
                    current_title = line.strip()
                else:
                    current_content.append(line)
        
        # Ajouter la dernière section
        if current_section:
            sections[current_section] = {
                'title': current_title,
                'content': '\n'.join(current_content)
            }
        
        return sections
    
    def insert_section(self, code: str, data: Dict):
        """Insère une section dans la base"""
        try:
            # Calculer le taux moyen (approximatif)
            taux_moyen = self.calculate_section_average_rate(code)
            
            self.cursor.execute("""
                INSERT INTO cedeo_sections (code_section, titre_section, description_section, taux_moyen)
                VALUES (%s, %s, %s, %s)
            """, (code, data['title'], data['title'], taux_moyen))
            
        except Exception as e:
            print(f"⚠️ Erreur insertion section {code}: {e}")
    
    def calculate_section_average_rate(self, section_code: str) -> float:
        """Calcule le taux moyen approximatif pour une section"""
        taux_par_section = {
            'I': 10.50, 'II': 8.75, 'III': 12.00, 'IV': 15.25, 'V': 5.50,
            'VI': 18.75, 'VII': 14.50, 'VIII': 16.25, 'IX': 11.75, 'X': 13.50,
            'XI': 17.25, 'XII': 19.50, 'XIII': 9.25, 'XIV': 25.00, 'XV': 12.75,
            'XVI': 22.50, 'XVII': 20.75, 'XVIII': 16.50, 'XIX': 35.00, 'XX': 15.75, 'XXI': 30.00
        }
        return taux_par_section.get(section_code, 15.00)
    
    def parse_section_content(self, content: str, section_code: str) -> int:
        """Parse le contenu d'une section pour extraire les codes tarifaires"""
        codes_count = 0
        current_chapter = None
        current_chapter_title = ""
        
        lines = content.split('\n')
        i = 0
        while i < len(lines):
            line = lines[i].strip()
            if not line:
                i += 1
                continue
            
            # Détecter les chapitres (format: XX.XX avec espaces et titre)
            chapter_match = re.match(r'^(\d{2}\.\d{2})\s+(.+)$', line)
            if chapter_match:
                chapter_code = chapter_match.group(1)
                chapter_title = chapter_match.group(2).strip()
                
                # Vérifier que ce n'est pas un code tarifaire (qui commence par 4 chiffres)
                if not re.match(r'^\d{4}\.\d{2}', line):
                    current_chapter = chapter_code
                    current_chapter_title = chapter_title
                    self.insert_chapter(current_chapter, current_chapter_title, section_code)
                    print(f"    Chapitre {chapter_code}: {chapter_title[:50]}...")
                    i += 1
                    continue
            
            # Détecter les codes tarifaires (format: XXXX.XX.XX.XX avec espaces au début)
            code_match = re.match(r'^\s*(\d{4}\.\d{2}\.\d{2}\.\d{2})\s*[-–]\s*(.+)$', line)
            if code_match and current_chapter:
                code = code_match.group(1)
                description = code_match.group(2).strip()
                
                # Nettoyer la description (enlever les informations de formatage)
                description = re.sub(r'\s+kg\s+\d+\s+\d+\s*$', '', description)
                description = re.sub(r'\s+kg\s+\d+\s*$', '', description)
                description = re.sub(r'\s+\d+\s+\d+\s*$', '', description)
                description = description.strip()
                
                # Chercher le taux sur la ligne suivante
                taux = 15.00  # taux par défaut
                if i + 1 < len(lines):
                    next_line = lines[i + 1].strip()
                    # Format: "u 5 1" où 5 est le taux
                    taux_match = re.match(r'^\s*u\s+(\d+)\s+\d+\s*$', next_line)
                    if taux_match:
                        taux = float(taux_match.group(1))
                        i += 1  # passer à la ligne suivante
                
                self.insert_tariff_code(code, description, current_chapter, section_code, taux)
                codes_count += 1
                i += 1
                continue
            
            i += 1
        
        return codes_count
    
    def insert_chapter(self, code: str, title: str, section_code: str):
        """Insère un chapitre dans la base"""
        try:
            self.cursor.execute("""
                INSERT INTO cedeo_chapitres (code_chapitre, titre_chapitre, description_chapitre, code_section)
                VALUES (%s, %s, %s, %s)
            """, (code, title, title, section_code))
        except Exception as e:
            print(f"⚠️ Erreur insertion chapitre {code}: {e}")
    
    def insert_tariff_code(self, code: str, description: str, chapter: str, section: str, taux: float):
        """Insère un code tarifaire dans la base"""
        try:
            self.cursor.execute("""
                INSERT INTO cedeo_codes_tarifaires 
                (code_tarifaire, description_produit, code_chapitre, code_section, taux_imposition)
                VALUES (%s, %s, %s, %s, %s)
            """, (code, description, chapter, section, taux))
        except Exception as e:
            print(f"⚠️ Erreur insertion code {code}: {e}")
    
    def generate_keywords(self):
        """Génère les mots-clés pour la recherche"""
        try:
            # Récupérer tous les codes tarifaires
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
            print(f"❌ Erreur génération mots-clés: {e}")
    
    def extract_keywords(self, text: str) -> Dict[str, int]:
        """Extrait les mots-clés d'un texte"""
        # Normaliser le texte
        text = text.lower()
        text = re.sub(r'[^\w\s]', ' ', text)
        
        # Mots à ignorer
        stop_words = {'et', 'ou', 'de', 'du', 'des', 'le', 'la', 'les', 'un', 'une', 'pour', 'avec', 'sans', 'par'}
        
        # Extraire les mots
        words = text.split()
        keywords = {}
        
        for word in words:
            if len(word) > 2 and word not in stop_words:
                # Poids basé sur la longueur et la fréquence
                poids = min(len(word), 5)
                keywords[word] = max(keywords.get(word, 0), poids)
        
        return keywords
    
    def get_statistics(self) -> Dict:
        """Retourne les statistiques de la base"""
        try:
            stats = {}
            
            # Compter les sections
            self.cursor.execute("SELECT COUNT(*) as count FROM cedeo_sections")
            stats['sections'] = self.cursor.fetchone()['count']
            
            # Compter les chapitres
            self.cursor.execute("SELECT COUNT(*) as count FROM cedeo_chapitres")
            stats['chapitres'] = self.cursor.fetchone()['count']
            
            # Compter les codes tarifaires
            self.cursor.execute("SELECT COUNT(*) as count FROM cedeo_codes_tarifaires")
            stats['codes_tarifaires'] = self.cursor.fetchone()['count']
            
            # Compter les mots-clés
            self.cursor.execute("SELECT COUNT(*) as count FROM cedeo_mots_cles")
            stats['mots_cles'] = self.cursor.fetchone()['count']
            
            return stats
            
        except Exception as e:
            print(f"❌ Erreur statistiques: {e}")
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
            print(f"❌ Erreur export JSON: {e}")

def main():
    """Fonction principale"""
    print("Parser TEC CEDEAO pour MySQL")
    print("=" * 50)
    
    # Configuration MySQL (ajustez selon votre configuration)
    parser = TECParserMySQL(
        host='localhost',
        port=4240,  # Port MAMP par défaut
        user='root',
        password='root',  # MAMP utilise 'root' comme mot de passe par défaut
        database='douane'
    )
    
    # Connexion
    if not parser.connect_db():
        sys.exit(1)
    
    try:
        # Créer les tables
        if not parser.create_tables():
            sys.exit(1)
        
        # Parser le fichier TEC
        filename = 'MON-TEC-CEDEAO-SH-2022-FREN-09-04-2024.txt'
        total_codes = parser.parse_tec_file(filename)
        
        if total_codes > 0:
            # Statistiques
            stats = parser.get_statistics()
            print("\nStatistiques:")
            for key, value in stats.items():
                print(f"  {key}: {value}")
            
            # Export JSON
            parser.export_to_json('cedeo_rules_mysql.json')
            
            print(f"\nParsing termine avec succes!")
            print(f"Fichier JSON cree: cedeo_rules_mysql.json")
        else:
            print("Aucun code tarifaire trouve")
            
    except Exception as e:
        print(f"Erreur: {e}")
    finally:
        parser.close_db()

if __name__ == "__main__":
    main()
