#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Analyse de la structure du fichier TEC CEDEAO
"""

import re

def analyze_tec_structure():
    """Analyse la structure du fichier TEC"""
    print("Analyse de la structure du fichier TEC CEDEAO")
    print("=" * 60)
    
    try:
        with open('MON-TEC-CEDEAO-SH-2022-FREN-09-04-2024.txt', 'r', encoding='utf-8') as f:
            content = f.read()
        
        lines = content.split('\n')
        
        # Compter les sections
        sections = []
        current_section = None
        
        # Compter les chapitres potentiels
        potential_chapters = []
        chapter_pattern = r'^(\d{2}\.\d{2})\s+(.+)$'
        
        # Compter les codes tarifaires
        tariff_codes = []
        code_pattern = r'^\s*(\d{4}\.\d{2}\.\d{2}\.\d{2})\s*[-–]\s*(.+)$'
        
        for i, line in enumerate(lines):
            line = line.strip()
            if not line:
                continue
            
            # Détecter les sections
            section_match = re.match(r'^SECTION\s+([IVX]+)\s*$', line, re.IGNORECASE)
            if section_match:
                current_section = section_match.group(1)
                sections.append(current_section)
                print(f"Section {current_section} trouvée à la ligne {i+1}")
                continue
            
            # Détecter les chapitres potentiels
            chapter_match = re.match(chapter_pattern, line)
            if chapter_match:
                chapter_code = chapter_match.group(1)
                chapter_title = chapter_match.group(2).strip()
                
                # Vérifier si c'est vraiment un chapitre (pas un code tarifaire)
                if not re.match(r'^\d{4}\.\d{2}', line):
                    potential_chapters.append({
                        'code': chapter_code,
                        'title': chapter_title,
                        'line': i+1,
                        'section': current_section
                    })
                    print(f"Chapitre {chapter_code}: {chapter_title[:50]}... (ligne {i+1})")
            
            # Détecter les codes tarifaires
            code_match = re.match(code_pattern, line)
            if code_match:
                code = code_match.group(1)
                description = code_match.group(2).strip()
                tariff_codes.append({
                    'code': code,
                    'description': description,
                    'line': i+1
                })
        
        print(f"\nRésumé:")
        print(f"Sections trouvées: {len(sections)}")
        print(f"Chapitres potentiels: {len(potential_chapters)}")
        print(f"Codes tarifaires: {len(tariff_codes)}")
        
        # Analyser les chapitres par section
        print(f"\nChapitres par section:")
        chapters_by_section = {}
        for chapter in potential_chapters:
            section = chapter['section']
            if section not in chapters_by_section:
                chapters_by_section[section] = []
            chapters_by_section[section].append(chapter['code'])
        
        for section in sorted(chapters_by_section.keys()):
            chapters = chapters_by_section[section]
            print(f"Section {section}: {len(chapters)} chapitres - {chapters}")
        
        # Afficher quelques exemples de codes tarifaires
        print(f"\nExemples de codes tarifaires:")
        for i, code in enumerate(tariff_codes[:10]):
            print(f"  {code['code']}: {code['description'][:50]}...")
        
        return {
            'sections': sections,
            'chapters': potential_chapters,
            'tariff_codes': tariff_codes
        }
        
    except Exception as e:
        print(f"Erreur: {e}")
        return None

if __name__ == "__main__":
    analyze_tec_structure()
