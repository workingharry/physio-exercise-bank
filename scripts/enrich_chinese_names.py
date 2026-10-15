import json
import re

def get_clinical_chinese_name(name, subregion, movement_types, pathologies):
    n = name.strip()
    
    # 1. High precision clinical protocols & named techniques
    SPECIFIC = {
        'Standing / seated isometric heel-raise hold': '站姿/坐姿等長提踵靜態維持 (比目魚肌/腓腸肌活化)',
        'Flat-ground heel raise': '平地雙腳提踵 (踮腳尖肌力基礎)',
        'Seated bent-knee calf raise HSR': '坐姿屈膝比目魚肌高負荷肌腱訓練 (HSR)',
        'Step-edge eccentric & HSR heel drop': '台階邊緣離心下沉與高負荷肌腱修復 (Alfredson)',
        'Inner-range plantarflexion heel-block raise': '內側角度蹠屈墊木提踵 (足底深層穩定)',
        'Single-leg weighted Smith-machine / dumbbell calf press': '單腳負重史密斯機/啞鈴小腿推蹬',
        'Bilateral-to-unilateral pogo hops': '雙腳轉單腳連續踝彈跳 (Pogo Hops 增強式)',
        'Forward single-leg hop & incline sprint acceleration': '前向單腳跳躍與坡度衝刺加速',
        'Post-cast unloaded active ROM, scar glide & stationary bike (Ankle Fracture Wk 2–6)': '拆石膏早期無負重主動活動度、疤痕滑動與飛輪訓練',
        'Plantar fascia myofascial release & "Pronation-Unlocking" Wedge Lunge (Pes Cavus)': '足底筋膜筋膜球放鬆與高弓足旋前解鎖斜木弓箭步',
        'Graduated bathroom-scale weight-shifting & Rocker-To-Flat gait weaning (Post-ORIF)': '體重計漸進負重轉移與術後過渡步態訓練',
        'Banded Knee-to-Wall dorsiflexion & Low-Load Long-Duration calf stretch': '彈力帶屈膝觸牆背屈活動度與低負荷長時間小腿伸展',
        'Resisted band ankle eversion & dorsiflexion (Peroneus Brevis/Tertius anti-varus)': '彈力帶抗阻外翻與背屈 (腓骨短肌抗內翻強化)',
        'Seated & standing calf raise HSR (1st-ray centered, avoiding lateral varus roll)': '坐姿與站姿提踵 HSR (第一蹠骨居中防止外側翻滾)',
        'Split squat & step-down with "Soft-Arch / Knee-Over-1st-Toe" pronation absorption': '分腿蹲與下台階 (軟足弓緩衝與膝對齊第一趾)',
        'Single-leg balance on compliant foam & soft triple-flexion drop landing (RTS)': '軟墊單腳平衡與三屈緩衝軟著地 (重返運動期)',
        'Banded talocrural distraction & posterior talar glide (Anterior Impingement)': '彈力帶距骨小腿關節牽引與向後滑動鬆動術 (前夾擠)',
        'Seated FHL tendon gliding & isolated big-toe isometric press (Posterior / FHL)': '坐姿屈拇長肌肌腱滑行與大拇趾獨立等長下壓',
        'Flat-ground heel raise with relaxed toes (stopping shy of posterior pinch)': '放鬆腳趾平地提踵 (止於後側夾擠角度前)',
        'Resisted FHL band flexion & Toe-Off towel press (FHL Stage 2 HSR)': '彈力帶屈拇長肌抗阻彎曲與蹬地毛巾下壓 (FHL二期HSR)'
    }
    if n in SPECIFIC:
        return SPECIFIC[n]

    # 2. Rich pattern mapping
    patterns = [
        (r'(?i)\bnordic hamstring curl\b', '北歐膕旁肌離心彎舉'),
        (r'(?i)\breverse nordic\b', '反向北歐股四頭肌離心伸展'),
        (r'(?i)\bcopenhagen adduction\b', '哥本哈根內收肌動態/等長訓練'),
        (r'(?i)\bcopenhagen\b', '哥本哈根內收肌訓練'),
        (r'(?i)\bspanish squat\b', '西班牙深蹲 (彈力帶髕骨肌腱高負荷)'),
        (r'(?i)\bsissy squat\b', '西西深蹲 (膝關節前向離心負重)'),
        (r'(?i)\baskling l-protocol\b', 'Askling L-Protocol 膕旁肌離心三部曲'),
        (r'(?i)\balfredson\b', 'Alfredson 階梯離心下沉肌腱訓練'),
        (r'(?i)\bwindlass protocol\b', 'Windlass 足底筋膜絞盤機制負載'),
        (r'(?i)\bterminal knee extension\b|\btke\b', '末端膝伸展 (TKE) 內側股肌活化'),
        (r'(?i)\bshort arc quad\b|\bsaq\b', '短弧度股四頭肌伸展 (SAQ)'),
        (r'(?i)\blong arc quad\b|\blaq\b', '長弧度股四頭肌伸展 (LAQ)'),
        (r'(?i)\bquad set\b', '股四頭肌等長收縮 (Quad Set)'),
        (r'(?i)\bstraight leg raise\b|\bslr\b', '直腿抬高訓練 (SLR)'),
        (r'(?i)\bpogo hops?\b', '連續踝彈跳 (Pogo Hops 增強式)'),
        (r'(?i)\bdrop jump\b', '跳深反彈跳躍 (Drop Jump)'),
        (r'(?i)\bdepth jump\b', '下落著地深跳 (Depth Jump)'),
        (r'(?i)\bbroad jump\b', '雙腳立定前跳爆發力'),
        (r'(?i)\btuck jump\b', '收膝跳躍訓練'),
        (r'(?i)\bskater jump\b|\bskater hop\b', '側向滑冰者單腳跳'),
        (r'(?i)\bbox jump\b', '跳箱爆發力訓練'),
        (r'(?i)\bstep-down\b|\bstep down\b', '下台階離心控制訓練'),
        (r'(?i)\bstep-up\b|\bstep up\b', '上階梯登階肌力訓練'),
        (r'(?i)\bheel drop\b', '階梯足跟下沉 (離心伸展)'),
        (r'(?i)\bheel raise\b|\bcalf raise\b', '小腿提踵訓練 (踮腳尖)'),
        (r'(?i)\bknee-to-wall\b', '屈膝觸牆背屈活動度檢測與伸展'),
        (r'(?i)\bmonster walk\b', '彈力帶怪獸步橫向行走 (臀中肌)'),
        (r'(?i)\bcrab walk\b', '彈力帶螃蟹步外展橫移'),
        (r'(?i)\bclamshell\b|\bclam shell\b', '蚌殼式臀中肌外展訓練'),
        (r'(?i)\bglute bridge\b', '臀橋式骨盆抬高訓練'),
        (r'(?i)\bhip thrust\b', '負重臀推爆發力訓練'),
        (r'(?i)\bsingle-leg rdl\b|\bsingle leg rdl\b', '單腳羅馬尼亞硬舉 (平衡與後側鏈)'),
        (r'(?i)\bromanian deadlift\b|\brdl\b', '羅馬尼亞硬舉 (RDL 膕旁肌與臀肌)'),
        (r'(?i)\bdeadlift\b', '硬舉肌力訓練'),
        (r'(?i)\bbulgarian split squat\b', '保加利亞分腿蹲'),
        (r'(?i)\bsplit squat\b', '分腿蹲 (跨步深蹲)'),
        (r'(?i)\bgoblet squat\b', '高腳杯深蹲 (深蹲動作模式)'),
        (r'(?i)\bfront squat\b', '前蹲舉 (股四頭肌焦點)'),
        (r'(?i)\bback squat\b', '後蹲舉 (全身下肢動力鏈)'),
        (r'(?i)\bwall sit\b', '靠牆等長靜蹲 (髕股關節低壓負重)'),
        (r'(?i)\blateral lunge\b|\bside lunge\b', '側向弓箭步 (額狀面控制)'),
        (r'(?i)\breverse lunge\b', '後跨步弓箭步'),
        (r'(?i)\bforward lunge\b', '前跨步弓箭步'),
        (r'(?i)\bwalking lunge\b', '行進間弓箭步'),
        (r'(?i)\bcurtsy lunge\b', '交叉式屈膝蹲 (Curtsy Lunge)'),
        (r'(?i)\bleg press\b', '腿推機推蹬閉鎖鏈肌力'),
        (r'(?i)\bleg extension\b', '坐姿腿伸展機訓練 (開放鏈股四頭肌)'),
        (r'(?i)\bleg curl\b', '腿彎舉機訓練 (開放鏈膕旁肌)'),
        (r'(?i)\bcalf press\b', '小腿腿推提踵訓練'),
        (r'(?i)\bheel slide\b', '仰臥足跟滑行 (膝屈曲活動度)'),
        (r'(?i)\bprone hang\b', '俯臥垂腿膝完全伸展鬆動術'),
        (r'(?i)\bpatellar mobilization\b', '髕骨多向度關節鬆動術'),
        (r'(?i)\btalocrural distraction\b', '距骨小腿關節牽引'),
        (r'(?i)\bposterior talar glide\b', '距骨向後滑動鬆動術'),
        (r'(?i)\bfhl tendon gliding\b', '屈拇長肌 (FHL) 肌腱滑行術'),
        (r'(?i)\bfhl band flexion\b', '彈力帶抗阻屈拇與大腳趾蹬地下壓'),
        (r'(?i)\badductor squeeze\b', '內收肌群等長夾球訓練'),
        (r'(?i)\badductor rock-back\b', '四足跪姿內收肌搖擺伸展'),
        (r'(?i)\bfire hydrant\b', '四足跪姿消防栓側抬腿 (臀中肌)'),
        (r'(?i)\bdonkey kick\b', '四足跪姿後踢腿 (臀大肌分離活化)'),
        (r'(?i)\bbird dog\b', '鳥狗式對角四肢伸展核心穩定'),
        (r'(?i)\bdead bug\b', '死蟲式核心協同控制'),
        (r'(?i)\bside plank\b', '側棒式軀幹與側鏈支撐'),
        (r'(?i)\bprone plank\b|\bplank\b', '棒式核心抗伸展支撐'),
        (r'(?i)\bpallof press\b', '帕洛夫抗旋轉推舉'),
        (r'(?i)\bsingle-leg stance\b|\bsingle leg stance\b|\bsingle-leg balance\b', '單腳站立本體感覺平衡'),
        (r'(?i)\bstar excursion\b|\by-balance\b', 'Y字平衡 / 星狀延展動態平衡 (SEBT)'),
        (r'(?i)\beversion\b', '踝關節抗阻外翻訓練 (腓骨肌群)'),
        (r'(?i)\binversion\b', '踝關節抗阻內翻訓練 (脛後肌群)'),
        (r'(?i)\bdorsiflexion\b', '踝關節主動背屈與伸展拉筋'),
        (r'(?i)\bplantarflexion\b', '踝關節蹠屈離心/向心肌力訓練'),
        (r'(?i)\bweight-shifting\b', '漸進負重轉移步態平衡過渡'),
        (r'(?i)\bgait\b', '步態與觸地生物力學重塑'),
        (r'(?i)\bmyofascial release\b', '筋膜球自我肌筋膜放鬆'),
        (r'(?i)\bactive rom\b|\brom\b', '主動關節活動度訓練 (ROM)'),
        (r'(?i)\bscar glide\b', '手術疤痕滑動組織鬆解'),
        (r'(?i)\bdeceleration\b', '衝刺減速著地緩衝控制'),
        (r'(?i)\bdrop landing\b', '跳落軟著地緩衝 (防膝外翻)'),
        (r'(?i)\bvalgus\b', '防膝外翻臀肌與動態對齊控制'),
        (r'(?i)\bhip abduction\b', '髖關節外展肌力強化 (臀中肌/臀小肌)'),
        (r'(?i)\bhip adduction\b', '髖關節內收肌群強化'),
        (r'(?i)\bhip internal rotation\b', '髖關節內旋控制與活動度'),
        (r'(?i)\bhip external rotation\b', '髖關節外旋肌群強化'),
    ]

    for pat, chn in patterns:
        if re.search(pat, n):
            prefix = ""
            if re.search(r'(?i)\bstanding\b', n) and '站姿' not in chn: prefix += "站姿 "
            elif re.search(r'(?i)\bseated\b', n) and '坐姿' not in chn: prefix += "坐姿 "
            elif re.search(r'(?i)\bsupine\b', n) and '仰臥' not in chn: prefix += "仰臥 "
            elif re.search(r'(?i)\bprone\b', n) and '俯臥' not in chn: prefix += "俯臥 "
            elif re.search(r'(?i)\bside-lying\b', n) and '側臥' not in chn: prefix += "側臥 "
            elif re.search(r'(?i)\bhalf-kneeling\b', n) and '半跪' not in chn: prefix += "半跪姿 "

            if re.search(r'(?i)\bsingle-leg\b|\bsingle leg\b|\bunilateral\b', n) and '單腳' not in chn and '單側' not in chn:
                prefix += "單腳 "
            elif re.search(r'(?i)\bbilateral\b', n) and '雙腳' not in chn:
                prefix += "雙腳 "

            if re.search(r'(?i)\bbanded\b|\bresisted band\b', n) and '彈力帶' not in chn:
                prefix += "彈力帶 "
            elif re.search(r'(?i)\bdumbbell\b', n) and '啞鈴' not in chn:
                prefix += "啞鈴 "
            elif re.search(r'(?i)\bkettlebell\b', n) and '壺鈴' not in chn:
                prefix += "壺鈴 "
            elif re.search(r'(?i)\bweighted\b', n) and '負重' not in chn:
                prefix += "負重 "

            suffix = ""
            if re.search(r'(?i)\bisometric\b', n) and '等長' not in chn: suffix += " (等長維持)"
            elif re.search(r'(?i)\beccentric\b', n) and '離心' not in chn: suffix += " (離心負重)"
            elif re.search(r'(?i)\bhsr\b', n) and 'HSR' not in chn: suffix += " (HSR高負荷)"
            elif re.search(r'(?i)\bplyometric\b', n) and '增強式' not in chn: suffix += " (增強式)"

            return (prefix + chn + suffix).strip()

    # 3. Fallback descriptive generation
    posture = ""
    if re.search(r'(?i)\bstanding\b', n): posture = "站姿"
    elif re.search(r'(?i)\bseated\b', n): posture = "坐姿"
    elif re.search(r'(?i)\bsupine\b', n): posture = "仰臥"
    elif re.search(r'(?i)\bprone\b', n): posture = "俯臥"
    elif re.search(r'(?i)\bside-lying\b', n): posture = "側臥"
    elif re.search(r'(?i)\bhalf-kneeling\b', n): posture = "半跪姿"
    elif re.search(r'(?i)\bquadruped\b', n): posture = "四足跪姿"

    leg = ""
    if re.search(r'(?i)\bsingle-leg\b|\bsingle leg\b', n): leg = "單腳"
    elif re.search(r'(?i)\bbilateral\b', n): leg = "雙腳"

    tool = ""
    if re.search(r'(?i)\bbanded\b|\bband\b', n): tool = "彈力帶"
    elif re.search(r'(?i)\bdumbbell\b', n): tool = "啞鈴"
    elif re.search(r'(?i)\bkettlebell\b', n): tool = "壺鈴"
    elif re.search(r'(?i)\bbarbell\b', n): tool = "槓鈴"
    elif re.search(r'(?i)\bfoam roll\b', n): tool = "滾筒放鬆"

    sub = "下肢復健動態訓練"
    if 'Ankle' in subregion: sub = "踝足關節動態肌力與穩定訓練"
    elif 'Knee' in subregion: sub = "膝關節周邊動態肌力與對齊訓練"
    elif 'Hip' in subregion: sub = "髖骨盆肌群動態活化與控制訓練"

    combined = f"{posture} {leg} {tool} {sub}".strip()
    return re.sub(r'\s+', ' ', combined)

def main():
    with open('src/data/lowerLimbExercises.json', 'r', encoding='utf-8') as f:
        exercises = json.load(f)
        
    updated = 0
    for ex in exercises:
        zh = get_clinical_chinese_name(
            ex['name'], 
            ex.get('subRegion', ''), 
            ex.get('movementType', []), 
            ex.get('targetPathologies', [])
        )
        if zh and zh != ex['name']:
            ex['chineseName'] = zh
            updated += 1
            
    with open('src/data/lowerLimbExercises.json', 'w', encoding='utf-8') as f:
        json.dump(exercises, f, ensure_ascii=False, indent=2)
        
    print(f"✓ Successfully updated {updated} exercises with authentic clinical Traditional Chinese names!")

if __name__ == '__main__':
    main()
