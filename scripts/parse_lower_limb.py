import os
import glob
import re
import json
import zipfile
import xml.etree.ElementTree as ET

namespaces = {
    'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
    'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
}

def clean_text(text):
    if not text:
        return ''
    text = re.sub(r'\s+', ' ', text).strip()
    text = text.replace('$\\times$', 'x').replace('$\\ge$', '>=').replace('$\\le$', '<=')
    text = text.replace('$\\rightarrow$', '->').replace('$', '')
    return text

def slugify(text):
    text = re.sub(r'[\(\)\[\]\{\}\/\\,\.\:\;\#\$\%\^\&\*\+\=\~`\"\']', ' ', text)
    tokens = text.lower().split()
    return '-'.join(tokens[:7])

def determine_movement_types(training_type_str):
    tt = training_type_str.lower()
    res = []
    if 'isometric' in tt:
        res.append('Isometric')
    if 'concentric' in tt:
        res.append('Concentric')
    if 'eccentric' in tt:
        res.append('Eccentric')
    if 'plyometric' in tt or 'jump' in tt or 'hop' in tt:
        res.append('Plyometric')
    if 'mobility' in tt or 'rom' in tt or 'stretch' in tt or 'glide' in tt:
        res.append('Mobility')
    if 'proprioceptive' in tt or 'balance' in tt or 'perturbation' in tt or 'neuromuscular' in tt:
        res.append('Proprioception')
    if 'stability' in tt or 'stabilization' in tt:
        res.append('Stability')
    if 'motor control' in tt or 'activation' in tt:
        res.append('Motor Control')
    if not res:
        res.append('Concentric')
    return res

def determine_rehab_phases(stage_str):
    s = stage_str.lower()
    phases = []
    if 'acute' in s or 'early' in s or 'stage 1' in s or 'phase 1' in s or 'days' in s:
        phases.append('Phase 1: 急性保護/神經肌肉活化')
    if 'subacute' in s or 'sub-acute' in s or 'intermediate' in s or 'stage 2' in s or 'phase 2' in s:
        phases.append('Phase 2: 次急性控制負荷')
    if 'late' in s or 'strengthening' in s or 'stage 3' in s or 'phase 3' in s or 'hypertrophy' in s:
        phases.append('Phase 3: 後期肌力與肥大強化')
    if 'return' in s or 'sport' in s or 'plyometric' in s or 'stage 4' in s or 'phase 4' in s or 'agility' in s:
        phases.append('Phase 4: 增強式與重返運動')
    if not phases:
        phases = ['Phase 2: 次急性控制負荷']
    return phases

def determine_kinetic_chain(tt_str):
    t = tt_str.lower()
    if 'closed' in t or 'ckc' in t:
        return '閉鎖鏈 (CKC)'
    elif 'open' in t or 'okc' in t:
        return '開放鏈 (OKC)'
    return '閉鎖鏈 (CKC)'

def determine_planes(name, desc):
    txt = (name + ' ' + desc).lower()
    planes = []
    if any(k in txt for k in ['flexion', 'extension', 'dorsiflexion', 'plantarflexion', 'squat', 'hinge', 'lunge', 'step']):
        planes.append('矢狀面 (Sagittal)')
    if any(k in txt for k in ['abduction', 'adduction', 'inversion', 'eversion', 'lateral', 'valgus', 'varus']):
        planes.append('額狀面 (Frontal)')
    if any(k in txt for k in ['rotation', 'internal', 'external', 'transverse', 'pivot', 'twist']):
        planes.append('水平面 (Transverse)')
    if len(planes) > 1:
        planes.append('多平面 (Multi-planar)')
    if not planes:
        planes = ['矢狀面 (Sagittal)']
    return planes

def determine_equipment(name, instructions, desc):
    txt = (name + ' ' + instructions + ' ' + desc).lower()
    eq = []
    if 'band' in txt:
        eq.append('彈力帶 (Resistance Band)')
    if 'dumbbell' in txt:
        eq.append('啞鈴 (Dumbbell)')
    if 'kettlebell' in txt:
        eq.append('壺鈴 (Kettlebell)')
    if 'step' in txt or 'box' in txt or 'stair' in txt:
        eq.append('階梯/踏板 (Step/Box)')
    if 'disc' in txt or 'pad' in txt or 'bosu' in txt or 'wobble' in txt or 'foam' in txt:
        eq.append('平衡墊/平衡盤 (Balance Pad/Disc)')
    if 'wall' in txt:
        eq.append('牆面 (Wall)')
    if 'slant' in txt or 'wedge' in txt:
        eq.append('斜板 (Slant Board)')
    if not eq:
        eq.append('徒手 (Bodyweight)')
    return eq

def determine_difficulty(phases, movement_types):
    if 'Phase 4: 增強式與重返運動' in phases or 'Plyometric' in movement_types:
        return 'Advanced (進階)'
    elif 'Phase 3: 後期肌力與肥大強化' in phases or 'Eccentric' in movement_types:
        return 'Intermediate (中階)'
    return 'Beginner (初階)'

def parse_steps(instruction_str):
    if not instruction_str:
        return [{'stepNumber': 1, 'instruction': '依臨床指示進行操作。'}]
    
    # Split by 1) 2) 3) or Step 1, Step 2
    parts = re.split(r'(?:\d+\)|Step\s*\d+[\:\.]?)\s*', instruction_str)
    steps = []
    num = 1
    for p in parts:
        cleaned = p.strip()
        if cleaned:
            # find title or keyPoint if any
            key_point = ''
            if 'avoid' in cleaned.lower():
                key_point = '注意避免代償動作'
            elif 'hold' in cleaned.lower():
                key_point = '維持頂峰收縮'
            elif 'slow' in cleaned.lower() or 'eccentric' in cleaned.lower():
                key_point = '離心控制下放'

            steps.append({
                'stepNumber': num,
                'title': f'步驟 {num}',
                'instruction': cleaned,
                'keyPoint': key_point
            })
            num += 1
    return steps if steps else [{'stepNumber': 1, 'instruction': instruction_str}]

def parse_docx(docx_path, sub_region):
    try:
        with zipfile.ZipFile(docx_path) as z:
            xml_rels = z.read('word/_rels/document.xml.rels') if 'word/_rels/document.xml.rels' in z.namelist() else b''
            hyperlinks = {}
            if xml_rels:
                tree_rels = ET.fromstring(xml_rels)
                for rel in tree_rels:
                    if rel.attrib.get('Type', '').endswith('hyperlink'):
                        hyperlinks[rel.attrib.get('Id')] = rel.attrib.get('Target')

            tree_doc = ET.fromstring(z.read('word/document.xml'))
            tables = tree_doc.findall('.//w:tbl', namespaces)
            if not tables:
                return []

            # Overview table (Table 0)
            overview_tbl = tables[0]
            overview_items = []
            for tr in overview_tbl.findall('.//w:tr', namespaces):
                cells = []
                for tc in tr.findall('.//w:tc', namespaces):
                    txt = ' '.join([''.join([t.text for t in p.iterfind('.//w:t', namespaces) if t.text]).strip() for p in tc.findall('.//w:p', namespaces)]).strip()
                    cells.append(clean_text(txt))
                if cells and len(cells) >= 2 and cells[0].isdigit():
                    num = int(cells[0])
                    name = cells[1]
                    ttype = cells[2] if len(cells) > 2 else ''
                    muscles = cells[3] if len(cells) > 3 else ''
                    overview_items.append({
                        'num': num,
                        'name': name,
                        'training_type': ttype,
                        'target_muscles': muscles
                    })

            # Detail tables
            detail_tables = tables[1:]
            parsed_exercises = []
            topic_title = os.path.basename(docx_path).replace('.docx', '').replace('Exercise Bank', '').replace('Rehabilitation', '').strip()

            for idx, tbl in enumerate(detail_tables):
                fields = {}
                video_url = ''
                for tr in tbl.findall('.//w:tr', namespaces):
                    cells = []
                    for tc in tr.findall('.//w:tc', namespaces):
                        # check hyperlink in tc
                        for hl in tc.iterfind('.//w:hyperlink', namespaces):
                            r_id = hl.attrib.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id')
                            if r_id in hyperlinks:
                                url = hyperlinks[r_id]
                                if 'youtube.com' in url or 'youtu.be' in url or 'vimeo.com' in url:
                                    video_url = url
                        txt = ' '.join([''.join([t.text for t in p.iterfind('.//w:t', namespaces) if t.text]).strip() for p in tc.findall('.//w:p', namespaces)]).strip()
                        cells.append(clean_text(txt))
                    if len(cells) >= 2:
                        k = cells[0].lower()
                        v = cells[1]
                        if k not in ['field', 'parameter']:
                            fields[k] = v

                # Overview match
                if idx < len(overview_items):
                    name = overview_items[idx]['name']
                    overview_type = overview_items[idx]['training_type']
                    overview_muscles = overview_items[idx]['target_muscles']
                else:
                    name = f"{topic_title} - Exercise {idx+1}"
                    overview_type = ''
                    overview_muscles = ''

                ttype = fields.get('strength / training type', overview_type)
                muscles_raw = fields.get('target muscles', overview_muscles)
                instructions = fields.get('instructions', '')
                description = fields.get('description', '')
                dosage_raw = fields.get('dosage (fitt)', fields.get('dosage', '3 組 x 10-12 次'))
                progression_raw = fields.get('progression', '依臨床負荷耐受度漸進增加阻力')
                regression_raw = fields.get('regression', '退回雙腳支撐或減輕關節活動範圍')
                precautions_raw = fields.get('precautions / common errors', fields.get('precautions / common compensations', ''))
                suitable_raw = fields.get('suitable injury & rehab stage', topic_title)
                video_title = fields.get('video demonstration', '')
                ref_images = fields.get('reference image (search keywords)', fields.get('reference image keywords', ''))

                # Primary / secondary muscles
                muscles_list = [m.strip() for m in re.split(r'[,;]\s*', muscles_raw) if m.strip()]
                primary_muscles = muscles_list[:2] if muscles_list else ['主要下肢肌群']
                secondary_muscles = muscles_list[2:5] if len(muscles_list) > 2 else []

                movement_types = determine_movement_types(ttype)
                rehab_phases = determine_rehab_phases(suitable_raw)
                kinetic_chain = determine_kinetic_chain(ttype)
                planes = determine_planes(name, description)
                equipment = determine_equipment(name, instructions, description)
                difficulty = determine_difficulty(rehab_phases, movement_types)

                # Coaching cues & common errors
                cues = []
                errors = []
                if 'cues:' in precautions_raw.lower():
                    parts = re.split(r'cues:\s*', precautions_raw, flags=re.IGNORECASE)
                    errors.append(parts[0].strip())
                    cues.append(parts[1].strip())
                elif precautions_raw:
                    errors.append(precautions_raw)
                    cues.append('保持良好動作控制與呼吸對齊')

                # Video URL fallback
                if not video_url:
                    if video_title:
                        video_url = f"https://www.youtube.com/results?search_query={video_title.replace(' ', '+')}"
                    else:
                        video_url = f"https://www.youtube.com/results?search_query={name.replace(' ', '+')}+physiotherapy"

                # SubRegion prefix for id
                prefix = 'ankle' if 'Ankle' in sub_region else ('knee' if 'Knee' in sub_region else 'hip')
                ex_id = f"{prefix}-{slugify(name)}"

                # Build Exercise object
                ex_obj = {
                    'id': ex_id,
                    'name': name,
                    'chineseName': name, # Will be enriched
                    'macroRegion': 'Lower Limb',
                    'subRegion': sub_region,
                    'movementType': movement_types,
                    'rehabPhase': rehab_phases,
                    'targetPathologies': [topic_title],
                    'equipment': equipment,
                    'difficulty': difficulty,
                    'media': {
                        'thumbnailUrl': f"/media/lower-limb/{prefix}/{slugify(name)}.jpg",
                        'videoUrl': video_url,
                        'videoType': 'youtube',
                        'muscleDiagramUrl': f"/media/diagrams/{prefix}-muscles.svg"
                    },
                    'biomechanics': {
                        'primaryMuscles': primary_muscles,
                        'secondaryMuscles': secondary_muscles,
                        'stabilizerMuscles': ['核心肌群', '局部關節穩定肌'],
                        'planesOfMotion': planes,
                        'jointActions': [ttype] if ttype else ['關節活動強化'],
                        'kineticChain': kinetic_chain
                    },
                    'execution': {
                        'startingPosition': instructions.split('.')[0] if instructions else '採標準臨床起始站姿或坐姿。',
                        'steps': parse_steps(instructions),
                        'coachingCues': cues if cues else ['軀幹穩定，動作流暢無代償'],
                        'commonErrors': errors if errors else ['關節力線偏移或代償晃動']
                    },
                    'regressions': [{'name': '退階動作', 'rationale': regression_raw}],
                    'progressions': [{'name': '進階動作', 'rationale': progression_raw}],
                    'dosage': {
                        'sets': '3-4 組',
                        'reps': '10-15 次',
                        'holdDuration': '3-5 秒' if 'Isometric' in movement_types else '依動作節奏',
                        'frequency': '每週 3-4 次',
                        'rest': '組間休息 60-90 秒',
                        'tempo': '2-0-2-0' if 'Eccentric' not in movement_types else '3-0-1-0'
                    },
                    'contraindications': ['患部急性劇烈撕裂痛', '疑似骨折未確診'],
                    'precautions': [precautions_raw] if precautions_raw else ['在無痛或輕微無害痠痛範圍內操作'],
                    'clinicalNotes': description
                }
                parsed_exercises.append(ex_obj)

            return parsed_exercises
    except Exception as e:
        print(f"Error in {docx_path}: {e}")
        return []

def main():
    base_dir = './lower_limb_source'
    all_data = []
    
    subregions = [
        ('Ankle', 'Ankle & Foot'),
        ('Knee', 'Knee'),
        ('Hip', 'Hip & Pelvis')
    ]

    for folder, sub_region in subregions:
        folder_path = os.path.join(base_dir, folder)
        files = glob.glob(os.path.join(folder_path, '*.docx'))
        print(f"Processing {folder}: {len(files)} files...")
        for f in sorted(files):
            exs = parse_docx(f, sub_region)
            all_data.extend(exs)

    print(f"Successfully processed {len(all_data)} exercises!")
    
    os.makedirs('./src/data', exist_ok=True)
    with open('./src/data/lowerLimbExercises.json', 'w', encoding='utf-8') as out:
        json.dump(all_data, out, ensure_ascii=False, indent=2)

    print("Saved to ./src/data/lowerLimbExercises.json")

if __name__ == '__main__':
    main()
