import { RehabProtocol } from '../types/exercise';

export const lowerLimbProtocols: RehabProtocol[] = [
  {
    id: 'protocol-ankle-sprain-cai',
    name: 'Acute Lateral Ankle Sprain & CAI Accelerated Protocol',
    chineseName: '外側踝關節扭傷與慢性踝不穩定 (CAI) 實證復健協定',
    subRegion: 'Ankle & Foot',
    indication: 'Grade I-III 外側副韌帶 (ATFL/CFL) 扭傷、反覆踝翻覆扭轉不穩定',
    guidelineReference: 'JOSPT 2021 Clinical Practice Guidelines (Martin et al.) & International Ankle Consortium',
    phases: [
      {
        phaseNumber: 1,
        phaseName: 'Phase 1: PEACE & LOVE 急性保護與消腫期',
        timeframe: 'Day 1 - 14',
        clinicalGoals: [
          '關節腫脹消除與距腿關節閉鎖位鎖定',
          '避免蹠屈加內翻拉扯受傷韌帶',
          '維持無痛等長外翻肌力 (Peroneal Activation)'
        ],
        criteriaToProgress: [
          '可完全無痛負重站立與平順行走',
          '距腿關節主動背屈角度達健側 85% 以上',
          '靜態單腳站立達 20 秒無劇痛'
        ],
        exercises: [
          'ankle-standing-seated-isometric-heel-raise-hold',
          'ankle-post-cast-unloaded-active-rom-scar-glide-stationary'
        ]
      },
      {
        phaseNumber: 2,
        phaseName: 'Phase 2: 次急性動態關節鬆動與肌力強化',
        timeframe: 'Week 2 - 6',
        clinicalGoals: [
          '重建立姿膝碰牆 (Knee-to-Wall) 背屈活動度',
          '第一蹠骨頭下壓與腓骨長肌閉鎖鏈鎖定',
          '初階本體感覺與踝關節外翻離心控制'
        ],
        criteriaToProgress: [
          '膝碰牆距離達健側 1-2 cm 內',
          '單腳提踵能連續完成 15 次無代償',
          'Y-Balance 達健側 90% 綜合評分'
        ],
        exercises: [
          'ankle-flat-ground-heel-raise',
          'ankle-seated-bent-knee-calf-raise-hsr'
        ]
      },
      {
        phaseNumber: 3,
        phaseName: 'Phase 3: 後期重返運動與衝擊穩定',
        timeframe: 'Week 6 - 12+',
        clinicalGoals: [
          '多方向連續彈跳著地穩定 (Hop-to-Stabilization)',
          '足踝剛性 (Ankle Stiffness) 與快伸展縮短循環 (SSC)',
          '側向切入與減速防扭轉反射'
        ],
        criteriaToProgress: [
          'FAAM 運動版自評量表評分 >= 90%',
          '單腳連續三連跳距離達健側 90% 以上',
          '急停與 90 度切入無踝關節不穩定感'
        ],
        exercises: [
          'ankle-bilateral-to-unilateral-pogo-hops',
          'ankle-forward-single-leg-hop-incline-sprint-acceleration'
        ]
      }
    ]
  },
  {
    id: 'protocol-aclr-rehabilitation',
    name: 'ACL Reconstruction (ACLR) Multiphase Criteria-Based Pathway',
    chineseName: '前十字韌帶重建 (ACLR) 準則導向分期復健協定',
    subRegion: 'Knee',
    indication: '自體髕骨肌腱或自體膕旁肌腱 ACL 重建術後',
    guidelineReference: 'Melbourne ACL Rehabilitation Guide 2.0 & Aspetar ACL Clinical Guidelines',
    phases: [
      {
        phaseNumber: 1,
        phaseName: 'Phase 1: 關節腫脹消除與終末伸直對齊',
        timeframe: 'Week 0 - 2',
        clinicalGoals: [
          '達成 0 度完整被動膝伸展 (Passive Knee Extension)',
          '抑制關節肌肉抑制現象 (AMI)，活化股四頭肌',
          '無跛行之完全負重行走 (Full Weight Bearing)'
        ],
        criteriaToProgress: [
          '髕骨自主滑動正常且膝關節過屈/伸直無卡阻',
          '股四頭肌等長收縮時髕骨明顯上提',
          '直膝抬腿無垂足 (No Extensor Lag)'
        ],
        exercises: [
          'knee-supine-quad-set-with-towel-roll-aclr',
          'knee-ankle-pumps'
        ]
      },
      {
        phaseNumber: 2,
        phaseName: 'Phase 2: 肌力與肥大重塑 (Strength & Hypertrophy)',
        timeframe: 'Week 6 - 16',
        clinicalGoals: [
          '漸進增加閉鎖鏈與開放鏈負荷 (OKC 90-45 度與 CKC 蹲)',
          '單腳下肢對稱指數 (LSI) 提升至 80%',
          '增強骨盆-髖-膝動態額狀面穩定 (防膝外翻 Valgus Collapse)'
        ],
        criteriaToProgress: [
          '單腳蹲膝蓋對齊第二腳趾無外翻陷落',
          '股四頭肌等速肌力對稱指數 LSI >= 80%',
          'Y-Balance 達標且關節無反覆水腫'
        ],
        exercises: [
          'knee-belted-spanish-squat-aclr',
          'knee-seated-open-kinetic-chain-okc-knee-extension'
        ]
      },
      {
        phaseNumber: 3,
        phaseName: 'Phase 3: 增強式反應與重返運動 (RTS)',
        timeframe: 'Month 6 - 9+',
        clinicalGoals: [
          '增強式快速反應與減速煞車控制',
          '旋轉切入與敏捷變向訓練',
          '心理準備與恐懼避免量表 (ACL-RSI) 達標'
        ],
        criteriaToProgress: [
          '單腳跳躍測試 (Hop Tests) 四項 LSI 全數 >= 90%',
          'ACL-RSI 心理量表得分 >= 75 分',
          '專項運動全面抗阻對抗測試通過'
        ],
        exercises: [
          'knee-double-leg-calf-raise-heel-raise',
          'knee-eccentric-heel-drop-alfredson-style'
        ]
      }
    ]
  },
  {
    id: 'protocol-hamstring-strain-askling',
    name: 'Acute Hamstring Strain Lengthening Protocol (Askling L-Protocol)',
    chineseName: '急性膕旁肌拉傷長力臂離心復健協定 (Askling L-Protocol)',
    subRegion: 'Hip & Pelvis',
    indication: '衝刺型或踢腿型膕旁肌二頭肌長頭/半腱肌拉傷',
    guidelineReference: 'Askling et al. (BJSM) L-Protocol & Aspetar Hamstring Guidelines',
    phases: [
      {
        phaseNumber: 1,
        phaseName: 'Phase 1: 急性神經肌肉活化與短力臂保護',
        timeframe: 'Day 1 - 5',
        clinicalGoals: [
          '控制局部血腫與肌肉水腫',
          '多角度無痛等長微負載收縮 (Submaximal Isometric Dig)',
          '避免長槓桿長度被動劇烈拉伸'
        ],
        criteriaToProgress: [
          '正常步態行走無痛且抗阻膝屈曲無劇烈刺痛',
          '無痛主動直膝抬腿達 70 度'
        ],
        exercises: [
          'hip-supine-submaximal-isometric-heel-dig-at-multiple-angles',
          'hip-supine-bilateral-to-unilateral-long-lever-glute-hamstring-bridge'
        ]
      },
      {
        phaseNumber: 2,
        phaseName: 'Phase 2: Askling 三大經典長力臂離心重塑 (The Extender / Diver / Glider)',
        timeframe: 'Day 5 - Week 4',
        clinicalGoals: [
          '大角度髖屈曲下長力臂離心伸展 (Extender & Diver)',
          '超最大長力臂滑步離心煞車 (Glider)',
          '軀幹核心與骨盆抗旋轉共收縮'
        ],
        criteriaToProgress: [
          'Askling H-Test (快速高抬腿直膝抬起) 無不適感與恐懼',
          '單腳 RDL 達健側完全活動度與肌力對稱'
        ],
        exercises: [
          'hip-askling-l-protocol-1-the-extender-dynamic-long-length',
          'hip-askling-l-protocol-2-the-diver-hip-hinge-lengthening',
          'hip-askling-l-protocol-3-the-glider-supramaximal-long-length'
        ]
      },
      {
        phaseNumber: 3,
        phaseName: 'Phase 3: 高速衝刺加速與重返賽場',
        timeframe: 'Week 3 - 6+',
        clinicalGoals: [
          '最高速衝刺加速時的膕旁肌末端擺動期抗拉伸',
          '大步幅 A-Skips, B-Skips 爪地動作',
          '北歐膕繩肌捲曲 (Nordic Curl) 離心煞車'
        ],
        criteriaToProgress: [
          '100% 全速衝刺加速及急停減速無痛',
          '雙側膕旁肌離心肌力測試對稱指數 >= 95%'
        ],
        exercises: [
          'hip-single-leg-romanian-deadlift-45°-hip-extension-bflh',
          'hip-nordic-hamstring-curl-knee-dominant-supramaximal-eccentric-braking',
          'hip-high-speed-a-skips-b-skips-paw-back-askling-h-test-sprint'
        ]
      }
    ]
  }
];
