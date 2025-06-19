import { JobTypeConfig, JobType, EvaluationCriterion } from '../types';

// ローカルストレージのキー
const STORAGE_KEY = 'hr_tool_evaluation_criteria';

// デフォルトの評価基準
export const DEFAULT_CRITERIA: Record<JobType, JobTypeConfig> = {
  fresh_sales: {
    id: 'fresh_sales',
    name: '新卒営業職',
    description: '営業未経験の新卒者向けポジション',
    evaluationCriteria: [
      // 能力経験
      {
        id: 'problem_identification',
        name: '問いの抑え力',
        description: '目的の設定にこだわり目的に立ち返り、手段と目的を逆転させず意思決定をする習慣がある（なぜ何のためにフェチ）',
        weight: 8,
        category: '能力経験'
      },
      {
        id: 'problem_solving',
        name: '問いの解決力',
        description: '目的や目標に対して現状を理解してそのGAPを埋める施策を考えて実行できる',
        weight: 8,
        category: '能力経験'
      },
      {
        id: 'persistence',
        name: 'やり切り力',
        description: '年単位で目標を設定し努力を経て困難な目標を達成した経験がある人',
        weight: 8,
        category: '能力経験'
      },
      {
        id: 'logical_thinking',
        name: '論理力',
        description: 'ファクトと主観を切り分けて自らの主張を根拠を持って構築できる（国語力）',
        weight: 7,
        category: '能力経験'
      },
      {
        id: 'communication',
        name: 'コミュニケーション能力',
        description: '傾聴力があり、情報や価値観や捉え方の観点で相手とのズレを認識でき、数字とストーリに基づいて伝達できる',
        weight: 9,
        category: '能力経験'
      },
      // 価値観
      {
        id: 'self_responsibility',
        name: '自責思考',
        description: '物事の原因に関してまず自分の改良の余地を探す',
        weight: 8,
        category: '価値観'
      },
      {
        id: 'extroversion',
        name: '内向的ではない',
        description: 'MBTIでEの人、人との会話が好きであること',
        weight: 7,
        category: '価値観'
      },
      {
        id: 'intellectual_curiosity',
        name: '知的好奇心',
        description: '知的好奇心が強く自分で情報をインプットすることが習慣化している',
        weight: 6,
        category: '価値観'
      },
      {
        id: 'team_activation',
        name: 'チーム活性力',
        description: 'チームワークのメリットを具体的に答えられ、実際にチームに対して良い影響を及ぼす働きかけをし主体的に行った経験がある',
        weight: 7,
        category: '価値観'
      },
      {
        id: 'honesty',
        name: '素直さ',
        description: '他人の意見を積極的に受け入れ、自分の行動や考え方に柔軟に組み込めるか。決まったことに関しては動く',
        weight: 7,
        category: '価値観'
      },
      {
        id: 'work_compatibility',
        name: '一緒に働きたいか',
        description: '一緒に働きたい人物であるか',
        weight: 8,
        category: '価値観'
      },
      {
        id: 'change_acceptance',
        name: '変化を歓迎する',
        description: '変化を拒まず新しい状況や機会を歓迎するマインドを持っている',
        weight: 6,
        category: '価値観'
      },
      {
        id: 'trust_ability',
        name: '信頼する力',
        description: '異なるを排除せず活かす意識でリスペクトがある。人の欠点ばかり見て減点的に人に向き合うのではなく人の良い点にフォーカスできる',
        weight: 6,
        category: '価値観'
      },
      // 志向性
      {
        id: 'mission_alignment',
        name: '理念共感',
        description: '人の生活を良くしていくことへの理念共感',
        weight: 8,
        category: '志向性'
      },
      {
        id: 'win_win_potential',
        name: 'WIN-WINになれるか',
        description: '会社が提供できる環境と本人が希望する働く上での軸やキャリアプランが長期的に考えてマッチするか（そうでないと人はやめる）',
        weight: 9,
        category: '志向性'
      }
    ]
  },
  experienced_sales: {
    id: 'experienced_sales',
    name: '中途営業職',
    description: '営業経験者向けポジション',
    evaluationCriteria: [
      // 能力経験（中途は実績重視）
      {
        id: 'problem_identification',
        name: '問いの抑え力',
        description: '目的の設定にこだわり目的に立ち返り、手段と目的を逆転させず意思決定をする習慣がある（なぜ何のためにフェチ）',
        weight: 9,
        category: '能力経験'
      },
      {
        id: 'problem_solving',
        name: '問いの解決力',
        description: '目的や目標に対して現状を理解してそのGAPを埋める施策を考えて実行できる',
        weight: 10,
        category: '能力経験'
      },
      {
        id: 'persistence',
        name: 'やり切り力',
        description: '年単位で目標を設定し努力を経て困難な目標を達成した経験がある人',
        weight: 9,
        category: '能力経験'
      },
      {
        id: 'logical_thinking',
        name: '論理力',
        description: 'ファクトと主観を切り分けて自らの主張を根拠を持って構築できる（国語力）',
        weight: 8,
        category: '能力経験'
      },
      {
        id: 'communication',
        name: 'コミュニケーション能力',
        description: '傾聴力があり、情報や価値観や捉え方の観点で相手とのズレを認識でき、数字とストーリに基づいて伝達できる',
        weight: 10,
        category: '能力経験'
      },
      // 価値観
      {
        id: 'self_responsibility',
        name: '自責思考',
        description: '物事の原因に関してまず自分の改良の余地を探す',
        weight: 8,
        category: '価値観'
      },
      {
        id: 'extroversion',
        name: '内向的ではない',
        description: 'MBTIでEの人、人との会話が好きであること',
        weight: 8,
        category: '価値観'
      },
      {
        id: 'intellectual_curiosity',
        name: '知的好奇心',
        description: '知的好奇心が強く自分で情報をインプットすることが習慣化している',
        weight: 6,
        category: '価値観'
      },
      {
        id: 'team_activation',
        name: 'チーム活性力',
        description: 'チームワークのメリットを具体的に答えられ、実際にチームに対して良い影響を及ぼす働きかけをし主体的に行った経験がある',
        weight: 7,
        category: '価値観'
      },
      {
        id: 'honesty',
        name: '素直さ',
        description: '他人の意見を積極的に受け入れ、自分の行動や考え方に柔軟に組み込めるか。決まったことに関しては動く',
        weight: 6,
        category: '価値観'
      },
      {
        id: 'work_compatibility',
        name: '一緒に働きたいか',
        description: '一緒に働きたい人物であるか',
        weight: 8,
        category: '価値観'
      },
      {
        id: 'change_acceptance',
        name: '変化を歓迎する',
        description: '変化を拒まず新しい状況や機会を歓迎するマインドを持っている',
        weight: 7,
        category: '価値観'
      },
      {
        id: 'trust_ability',
        name: '信頼する力',
        description: '異なるを排除せず活かす意識でリスペクトがある。人の欠点ばかり見て減点的に人に向き合うのではなく人の良い点にフォーカスできる',
        weight: 6,
        category: '価値観'
      },
      // 志向性
      {
        id: 'mission_alignment',
        name: '理念共感',
        description: '人の生活を良くしていくことへの理念共感',
        weight: 8,
        category: '志向性'
      },
      {
        id: 'win_win_potential',
        name: 'WIN-WINになれるか',
        description: '会社が提供できる環境と本人が希望する働く上での軸やキャリアプランが長期的に考えてマッチするか（そうでないと人はやめる）',
        weight: 10,
        category: '志向性'
      }
    ]
  },
  specialist: {
    id: 'specialist',
    name: '中途専門職',
    description: '専門スキルを要求される職種',
    evaluationCriteria: [
      // 能力経験（専門性重視）
      {
        id: 'problem_identification',
        name: '問いの抑え力',
        description: '目的の設定にこだわり目的に立ち返り、手段と目的を逆転させず意思決定をする習慣がある（なぜ何のためにフェチ）',
        weight: 10,
        category: '能力経験'
      },
      {
        id: 'problem_solving',
        name: '問いの解決力',
        description: '目的や目標に対して現状を理解してそのGAPを埋める施策を考えて実行できる',
        weight: 12,
        category: '能力経験'
      },
      {
        id: 'persistence',
        name: 'やり切り力',
        description: '年単位で目標を設定し努力を経て困難な目標を達成した経験がある人',
        weight: 9,
        category: '能力経験'
      },
      {
        id: 'logical_thinking',
        name: '論理力',
        description: 'ファクトと主観を切り分けて自らの主張を根拠を持って構築できる（国語力）',
        weight: 10,
        category: '能力経験'
      },
      {
        id: 'communication',
        name: 'コミュニケーション能力',
        description: '傾聴力があり、情報や価値観や捉え方の観点で相手とのズレを認識でき、数字とストーリに基づいて伝達できる',
        weight: 8,
        category: '能力経験'
      },
      // 価値観
      {
        id: 'self_responsibility',
        name: '自責思考',
        description: '物事の原因に関してまず自分の改良の余地を探す',
        weight: 8,
        category: '価値観'
      },
      {
        id: 'intellectual_curiosity',
        name: '知的好奇心',
        description: '知的好奇心が強く自分で情報をインプットすることが習慣化している',
        weight: 9,
        category: '価値観'
      },
      {
        id: 'team_activation',
        name: 'チーム活性力',
        description: 'チームワークのメリットを具体的に答えられ、実際にチームに対して良い影響を及ぼす働きかけをし主体的に行った経験がある',
        weight: 7,
        category: '価値観'
      },
      {
        id: 'honesty',
        name: '素直さ',
        description: '他人の意見を積極的に受け入れ、自分の行動や考え方に柔軟に組み込めるか。決まったことに関しては動く',
        weight: 7,
        category: '価値観'
      },
      {
        id: 'work_compatibility',
        name: '一緒に働きたいか',
        description: '一緒に働きたい人物であるか',
        weight: 7,
        category: '価値観'
      },
      {
        id: 'change_acceptance',
        name: '変化を歓迎する',
        description: '変化を拒まず新しい状況や機会を歓迎するマインドを持っている',
        weight: 6,
        category: '価値観'
      },
      {
        id: 'trust_ability',
        name: '信頼する力',
        description: '異なるを排除せず活かす意識でリスペクトがある。人の欠点ばかり見て減点的に人に向き合うのではなく人の良い点にフォーカスできる',
        weight: 6,
        category: '価値観'
      },
      // 志向性
      {
        id: 'mission_alignment',
        name: '理念共感',
        description: '人の生活を良くしていくことへの理念共感',
        weight: 7,
        category: '志向性'
      },
      {
        id: 'win_win_potential',
        name: 'WIN-WINになれるか',
        description: '会社が提供できる環境と本人が希望する働く上での軸やキャリアプランが長期的に考えてマッチするか（そうでないと人はやめる）',
        weight: 8,
        category: '志向性'
      }
    ]
  },
  engineer: {
    id: 'engineer',
    name: 'エンジニア',
    description: 'ソフトウェア開発エンジニア',
    evaluationCriteria: [
      // 能力経験（技術力重視）
      {
        id: 'problem_identification',
        name: '問いの抑え力',
        description: '目的の設定にこだわり目的に立ち返り、手段と目的を逆転させず意思決定をする習慣がある（なぜ何のためにフェチ）',
        weight: 9,
        category: '能力経験'
      },
      {
        id: 'problem_solving',
        name: '問いの解決力',
        description: '目的や目標に対して現状を理解してそのGAPを埋める施策を考えて実行できる',
        weight: 12,
        category: '能力経験'
      },
      {
        id: 'persistence',
        name: 'やり切り力',
        description: '年単位で目標を設定し努力を経て困難な目標を達成した経験がある人',
        weight: 8,
        category: '能力経験'
      },
      {
        id: 'logical_thinking',
        name: '論理力',
        description: 'ファクトと主観を切り分けて自らの主張を根拠を持って構築できる（国語力）',
        weight: 11,
        category: '能力経験'
      },
      {
        id: 'communication',
        name: 'コミュニケーション能力',
        description: '傾聴力があり、情報や価値観や捉え方の観点で相手とのズレを認識でき、数字とストーリに基づいて伝達できる',
        weight: 8,
        category: '能力経験'
      },
      // 価値観
      {
        id: 'self_responsibility',
        name: '自責思考',
        description: '物事の原因に関してまず自分の改良の余地を探す',
        weight: 8,
        category: '価値観'
      },
      {
        id: 'intellectual_curiosity',
        name: '知的好奇心',
        description: '知的好奇心が強く自分で情報をインプットすることが習慣化している',
        weight: 10,
        category: '価値観'
      },
      {
        id: 'team_activation',
        name: 'チーム活性力',
        description: 'チームワークのメリットを具体的に答えられ、実際にチームに対して良い影響を及ぼす働きかけをし主体的に行った経験がある',
        weight: 8,
        category: '価値観'
      },
      {
        id: 'honesty',
        name: '素直さ',
        description: '他人の意見を積極的に受け入れ、自分の行動や考え方に柔軟に組み込めるか。決まったことに関しては動く',
        weight: 7,
        category: '価値観'
      },
      {
        id: 'work_compatibility',
        name: '一緒に働きたいか',
        description: '一緒に働きたい人物であるか',
        weight: 7,
        category: '価値観'
      },
      {
        id: 'change_acceptance',
        name: '変化を歓迎する',
        description: '変化を拒まず新しい状況や機会を歓迎するマインドを持っている',
        weight: 8,
        category: '価値観'
      },
      {
        id: 'trust_ability',
        name: '信頼する力',
        description: '異なるを排除せず活かす意識でリスペクトがある。人の欠点ばかり見て減点的に人に向き合うのではなく人の良い点にフォーカスできる',
        weight: 6,
        category: '価値観'
      },
      // 志向性
      {
        id: 'mission_alignment',
        name: '理念共感',
        description: '人の生活を良くしていくことへの理念共感',
        weight: 7,
        category: '志向性'
      },
      {
        id: 'win_win_potential',
        name: 'WIN-WINになれるか',
        description: '会社が提供できる環境と本人が希望する働く上での軸やキャリアプランが長期的に考えてマッチするか（そうでないと人はやめる）',
        weight: 8,
        category: '志向性'
      }
    ]
  },
  part_time_base: {
    id: 'part_time_base',
    name: 'アルバイト（拠点）',
    description: '拠点業務を担当するアルバイトスタッフ',
    evaluationCriteria: [
      // 能力経験
      {
        id: 'basic_communication',
        name: '基本的コミュニケーション',
        description: '顧客や同僚と円滑にコミュニケーションが取れる',
        weight: 15,
        category: '能力経験'
      },
      {
        id: 'task_execution',
        name: '業務遂行力',
        description: '指示された業務を正確に実行できる',
        weight: 15,
        category: '能力経験'
      },
      {
        id: 'learning_ability',
        name: '学習能力',
        description: '新しい業務を覚えて実践できる',
        weight: 10,
        category: '能力経験'
      },
      {
        id: 'attention_to_detail',
        name: '注意力・正確性',
        description: 'ミスなく丁寧に業務を行える',
        weight: 12,
        category: '能力経験'
      },
      {
        id: 'customer_service',
        name: '接客・サービス',
        description: '顧客に対して適切な対応ができる',
        weight: 13,
        category: '能力経験'
      },
      // 価値観
      {
        id: 'reliability',
        name: '信頼性',
        description: '約束を守り、責任を持って業務に取り組む',
        weight: 15,
        category: '価値観'
      },
      {
        id: 'teamwork_basic',
        name: 'チームワーク',
        description: '他のスタッフと協力して業務を進められる',
        weight: 10,
        category: '価値観'
      },
      {
        id: 'positive_attitude',
        name: '前向きな姿勢',
        description: '積極的で前向きな態度で業務に取り組める',
        weight: 10,
        category: '価値観'
      },
      // 志向性
      {
        id: 'schedule_flexibility',
        name: 'スケジュール柔軟性',
        description: 'シフト制に対応でき、柔軟な働き方ができる',
        weight: 10,
        category: '志向性'
      }
    ]
  },
  part_time_sales: {
    id: 'part_time_sales',
    name: 'アルバイト（営業）',
    description: '営業サポートを担当するアルバイトスタッフ',
    evaluationCriteria: [
      // 能力経験
      {
        id: 'sales_communication',
        name: '営業コミュニケーション',
        description: '顧客との会話で信頼関係を築ける',
        weight: 18,
        category: '能力経験'
      },
      {
        id: 'sales_support',
        name: '営業サポート力',
        description: '営業活動のサポート業務を適切に行える',
        weight: 15,
        category: '能力経験'
      },
      {
        id: 'phone_skills',
        name: '電話対応力',
        description: '電話での顧客対応が適切にできる',
        weight: 12,
        category: '能力経験'
      },
      {
        id: 'data_management',
        name: 'データ管理',
        description: '顧客情報や営業データを正確に管理できる',
        weight: 10,
        category: '能力経験'
      },
      // 価値観
      {
        id: 'sales_mindset',
        name: '営業マインド',
        description: '顧客の課題解決に向けた意識を持っている',
        weight: 15,
        category: '価値観'
      },
      {
        id: 'persistence_basic',
        name: '継続力',
        description: '困難な状況でも諦めずに取り組める',
        weight: 12,
        category: '価値観'
      },
      {
        id: 'growth_mindset',
        name: '成長意欲',
        description: 'スキルアップや成長への意欲がある',
        weight: 8,
        category: '価値観'
      },
      // 志向性
      {
        id: 'sales_career_interest',
        name: '営業キャリア志向',
        description: '将来的に営業職への興味・関心がある',
        weight: 10,
        category: '志向性'
      }
    ]
  },
  // 新しく追加する専門職
  finance_accounting: {
    id: 'finance_accounting',
    name: '財務経理部',
    description: '財務・経理業務の専門職',
    evaluationCriteria: [
      // 能力経験
      {
        id: 'financial_analysis',
        name: '財務分析力',
        description: '財務諸表の分析や財務指標の理解・活用ができる',
        weight: 12,
        category: '能力経験'
      },
      {
        id: 'accounting_knowledge',
        name: '会計知識',
        description: '会計基準や税務に関する専門知識を有している',
        weight: 11,
        category: '能力経験'
      },
      {
        id: 'attention_to_detail_finance',
        name: '正確性・注意力',
        description: '数値の正確性にこだわり、ミスのない業務遂行ができる',
        weight: 10,
        category: '能力経験'
      },
      {
        id: 'system_proficiency',
        name: 'システム活用力',
        description: '会計システムやExcel等のツールを効率的に活用できる',
        weight: 8,
        category: '能力経験'
      },
      {
        id: 'logical_thinking_finance',
        name: '論理的思考力',
        description: '複雑な財務課題を論理的に分析・解決できる',
        weight: 9,
        category: '能力経験'
      },
      // 価値観
      {
        id: 'compliance_mindset',
        name: 'コンプライアンス意識',
        description: '法令遵守や内部統制の重要性を理解し実践できる',
        weight: 10,
        category: '価値観'
      },
      {
        id: 'continuous_learning_finance',
        name: '継続学習意欲',
        description: '会計基準の変更や新制度に対応するため継続的に学習する',
        weight: 8,
        category: '価値観'
      },
      {
        id: 'stakeholder_orientation',
        name: 'ステークホルダー志向',
        description: '経営陣や監査法人等との適切な関係構築ができる',
        weight: 7,
        category: '価値観'
      },
      {
        id: 'integrity_finance',
        name: '誠実性',
        description: '財務情報の透明性と正確性に対する高い倫理観を持つ',
        weight: 9,
        category: '価値観'
      },
      // 志向性
      {
        id: 'strategic_contribution',
        name: '戦略的貢献志向',
        description: '単なる数値管理を超えて経営戦略に貢献したい意欲がある',
        weight: 8,
        category: '志向性'
      },
      {
        id: 'professional_growth_finance',
        name: '専門性向上志向',
        description: '公認会計士や税理士等の資格取得や専門性向上への意欲',
        weight: 8,
        category: '志向性'
      }
    ]
  },
  human_resources: {
    id: 'human_resources',
    name: '人事部',
    description: '人事・人材開発の専門職',
    evaluationCriteria: [
      // 能力経験
      {
        id: 'people_management',
        name: '人材マネジメント力',
        description: '採用・育成・評価等の人事業務を戦略的に推進できる',
        weight: 12,
        category: '能力経験'
      },
      {
        id: 'communication_hr',
        name: 'コミュニケーション能力',
        description: '多様な立場の人と効果的にコミュニケーションが取れる',
        weight: 11,
        category: '能力経験'
      },
      {
        id: 'analytical_thinking_hr',
        name: '分析・企画力',
        description: '人事データを分析し、効果的な施策を企画・実行できる',
        weight: 10,
        category: '能力経験'
      },
      {
        id: 'labor_law_knowledge',
        name: '労働法知識',
        description: '労働基準法等の関連法規を理解し適切に運用できる',
        weight: 9,
        category: '能力経験'
      },
      {
        id: 'facilitation_skills',
        name: 'ファシリテーション力',
        description: '研修や会議の進行、組織開発を効果的に推進できる',
        weight: 8,
        category: '能力経験'
      },
      // 価値観
      {
        id: 'people_first_mindset',
        name: '人を大切にする価値観',
        description: '従業員の成長と幸福を真に願い、支援する姿勢がある',
        weight: 10,
        category: '価値観'
      },
      {
        id: 'fairness_hr',
        name: '公平性・中立性',
        description: '偏見なく公平な判断ができ、組織の調整役として機能できる',
        weight: 9,
        category: '価値観'
      },
      {
        id: 'confidentiality',
        name: '守秘義務意識',
        description: '機密情報の取り扱いに対する高い意識と責任感を持つ',
        weight: 8,
        category: '価値観'
      },
      {
        id: 'diversity_inclusion_mindset',
        name: 'ダイバーシティ&インクルージョン',
        description: '多様性を尊重し、包括的な組織づくりに貢献できる',
        weight: 8,
        category: '価値観'
      },
      {
        id: 'empathy_hr',
        name: '共感力',
        description: '他者の立場や感情を理解し、適切にサポートできる',
        weight: 9,
        category: '価値観'
      },
      // 志向性
      {
        id: 'organizational_development',
        name: '組織開発志向',
        description: '組織の成長と発展に貢献したいという強い意欲がある',
        weight: 8,
        category: '志向性'
      },
      {
        id: 'strategic_hr_orientation',
        name: '戦略人事志向',
        description: '経営戦略と連動した人事戦略の立案・実行に興味がある',
        weight: 8,
        category: '志向性'
      }
    ]
  },
  business_development: {
    id: 'business_development',
    name: '事業開発部',
    description: '新規事業開発・戦略企画の専門職',
    evaluationCriteria: [
      // 能力経験
      {
        id: 'strategic_thinking',
        name: '戦略的思考力',
        description: '市場分析から事業戦略を立案し、実行計画に落とし込める',
        weight: 12,
        category: '能力経験'
      },
      {
        id: 'market_analysis',
        name: '市場分析力',
        description: '市場動向や競合分析を通じて事業機会を発見できる',
        weight: 11,
        category: '能力経験'
      },
      {
        id: 'project_management_bd',
        name: 'プロジェクトマネジメント',
        description: '複数のプロジェクトを並行して効率的に推進できる',
        weight: 10,
        category: '能力経験'
      },
      {
        id: 'financial_modeling',
        name: '財務モデリング',
        description: '事業計画の財務モデルを作成し、投資判断に活用できる',
        weight: 9,
        category: '能力経験'
      },
      {
        id: 'stakeholder_management',
        name: 'ステークホルダー調整',
        description: '社内外の関係者を巻き込み、合意形成を図れる',
        weight: 8,
        category: '能力経験'
      },
      // 価値観
      {
        id: 'entrepreneurial_spirit',
        name: '起業家精神',
        description: '新しいことに挑戦し、リスクを取って価値創造に取り組める',
        weight: 10,
        category: '価値観'
      },
      {
        id: 'customer_centric_bd',
        name: '顧客中心思考',
        description: '顧客の真のニーズを理解し、価値提供にこだわれる',
        weight: 9,
        category: '価値観'
      },
      {
        id: 'agility_bd',
        name: 'アジリティ',
        description: '変化に素早く対応し、試行錯誤を通じて改善できる',
        weight: 8,
        category: '価値観'
      },
      {
        id: 'data_driven_mindset',
        name: 'データドリブン思考',
        description: 'データに基づいた意思決定と仮説検証を重視する',
        weight: 8,
        category: '価値観'
      },
      {
        id: 'collaboration_bd',
        name: '協働志向',
        description: '多様な専門性を持つメンバーと協力して成果を創出できる',
        weight: 9,
        category: '価値観'
      },
      // 志向性
      {
        id: 'innovation_drive',
        name: 'イノベーション志向',
        description: '既存の枠組みを超えた革新的な事業創造に挑戦したい',
        weight: 8,
        category: '志向性'
      },
      {
        id: 'growth_orientation_bd',
        name: '成長志向',
        description: '事業の成長と自身の成長を同時に追求する意欲がある',
        weight: 8,
        category: '志向性'
      }
    ]
  },
  marketing: {
    id: 'marketing',
    name: 'マーケター',
    description: 'マーケティング・ブランディングの専門職',
    evaluationCriteria: [
      // 能力経験
      {
        id: 'marketing_strategy',
        name: 'マーケティング戦略立案',
        description: '市場分析に基づいた効果的なマーケティング戦略を立案できる',
        weight: 12,
        category: '能力経験'
      },
      {
        id: 'digital_marketing',
        name: 'デジタルマーケティング',
        description: 'Web広告、SNS、SEO等のデジタル施策を効果的に活用できる',
        weight: 11,
        category: '能力経験'
      },
      {
        id: 'data_analysis_marketing',
        name: 'データ分析力',
        description: 'マーケティングデータを分析し、施策の改善に活用できる',
        weight: 10,
        category: '能力経験'
      },
      {
        id: 'creative_thinking',
        name: 'クリエイティブ思考',
        description: '魅力的なコンテンツやキャンペーンを企画・制作できる',
        weight: 9,
        category: '能力経験'
      },
      {
        id: 'brand_management',
        name: 'ブランドマネジメント',
        description: 'ブランド価値の向上と一貫性のあるブランド体験を設計できる',
        weight: 8,
        category: '能力経験'
      },
      // 価値観
      {
        id: 'customer_insight',
        name: '顧客洞察力',
        description: '顧客の行動や心理を深く理解し、ニーズを発見できる',
        weight: 10,
        category: '価値観'
      },
      {
        id: 'trend_sensitivity',
        name: 'トレンド感度',
        description: '市場や消費者のトレンドを敏感に察知し、施策に反映できる',
        weight: 9,
        category: '価値観'
      },
      {
        id: 'experimentation_mindset',
        name: '実験志向',
        description: 'A/Bテストや新しい手法を積極的に試し、学習を重視する',
        weight: 8,
        category: '価値観'
      },
      {
        id: 'storytelling',
        name: 'ストーリーテリング',
        description: '商品やサービスの価値を魅力的な物語として伝えられる',
        weight: 8,
        category: '価値観'
      },
      {
        id: 'roi_consciousness',
        name: 'ROI意識',
        description: '投資対効果を常に意識し、効率的な施策実行ができる',
        weight: 9,
        category: '価値観'
      },
      // 志向性
      {
        id: 'brand_building_passion',
        name: 'ブランド構築への情熱',
        description: '長期的な視点でブランド価値向上に貢献したい強い意欲',
        weight: 8,
        category: '志向性'
      },
      {
        id: 'omnichannel_orientation',
        name: 'オムニチャネル志向',
        description: 'オンライン・オフライン統合した顧客体験設計への興味',
        weight: 8,
        category: '志向性'
      }
    ]
  }
};

// ローカルストレージから評価基準を取得
const getStoredCriteria = (): Record<JobType, JobTypeConfig> | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to parse stored criteria:', error);
    return null;
  }
};

// ローカルストレージに評価基準を保存
const storeCriteria = (criteria: Record<JobType, JobTypeConfig>): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(criteria));
  } catch (error) {
    console.error('Failed to store criteria:', error);
  }
};

// 評価基準を初期化（初回のみ）
const initializeCriteria = (): void => {
  const stored = getStoredCriteria();
  if (!stored) {
    storeCriteria(DEFAULT_CRITERIA);
  }
};

// 初期化を実行
initializeCriteria();

// 評価基準を取得（同期版）
export const getJobTypeConfigSync = (jobType: JobType): JobTypeConfig => {
  const stored = getStoredCriteria();
  if (stored && stored[jobType]) {
    return stored[jobType];
  }
  return DEFAULT_CRITERIA[jobType];
};

// 全職種の設定を取得（同期版）
export const getAllJobTypesSync = (): JobTypeConfig[] => {
  const stored = getStoredCriteria();
  if (stored) {
    return Object.values(stored);
  }
  return Object.values(DEFAULT_CRITERIA);
};

// 評価基準を更新
export const updateEvaluationCriteria = async (
  jobType: JobType, 
  criteria: EvaluationCriterion[]
): Promise<void> => {
  const stored = getStoredCriteria() || { ...DEFAULT_CRITERIA };
  
  // 職種の設定を更新
  stored[jobType] = {
    ...stored[jobType],
    evaluationCriteria: criteria
  };
  
  // 保存
  storeCriteria(stored);
};

// 評価基準をリセット
export const resetEvaluationCriteria = (jobType: JobType): void => {
  const stored = getStoredCriteria() || { ...DEFAULT_CRITERIA };
  
  // デフォルト値に戻す
  stored[jobType] = DEFAULT_CRITERIA[jobType];
  
  // 保存
  storeCriteria(stored);
};

// 全ての評価基準をリセット
export const resetAllEvaluationCriteria = (): void => {
  storeCriteria(DEFAULT_CRITERIA);
};