import { JobTypeConfig, JobType, EvaluationCriterion } from '../types';

const STORAGE_KEY = 'hr_tool_evaluation_criteria';

export const DEFAULT_CRITERIA: Record<JobType, JobTypeConfig> = {
  fresh_sales: {
    id: 'fresh_sales',
    name: '新卒営業職',
    description: '営業未経験の新卒者向けポジション',
    evaluationCriteria: [
      {
        id: 'problem_identification',
        name: '問いの抑え力',
        description: '目的の設定にこだわり目的に立ち返り、手段と目的を逆転させず意思決定をする習慣がある（なぜ何のためにフェチ）',
        weight: 8,
        category: '能力経験',
        scoreDescriptions: [
          { score: 1, label: '不十分', description: '目的と手段を混同しがちで、なぜその行動を取るのかの理由が不明確' },
          { score: 2, label: 'やや不十分', description: '基本的な目的意識はあるが、深く掘り下げることは少ない' },
          { score: 3, label: '良好', description: '目的を意識して行動し、手段と目的の区別ができている' },
          { score: 4, label: '優秀', description: '常に「なぜ」「何のために」を問い、本質的な目的を見極めて行動できる' }
        ]
      },
      {
        id: 'communication',
        name: 'コミュニケーション能力',
        description: '傾聴力があり、情報や価値観や捉え方の観点で相手とのズレを認識でき、数字とストーリに基づいて伝達できる',
        weight: 9,
        category: '能力経験',
        scoreDescriptions: [
          { score: 1, label: '不十分', description: '一方的な会話になりがちで、相手の立場や考えを理解することが困難' },
          { score: 2, label: 'やや不十分', description: '基本的な会話はできるが、深い理解や効果的な伝達に課題' },
          { score: 3, label: '良好', description: '相手の話を聞き、理解した上で適切に自分の考えを伝えられる' },
          { score: 4, label: '優秀', description: '高い傾聴力で相手を理解し、データとストーリーを使って説得力のある伝達ができる' }
        ]
      },
      {
        id: 'mission_alignment',
        name: '理念共感',
        description: '人の生活を良くしていくことへの理念共感',
        weight: 8,
        category: '志向性',
        scoreDescriptions: [
          { score: 1, label: '不十分', description: '会社の理念への理解や共感が見られない' },
          { score: 2, label: 'やや不十分', description: '理念を理解しているが、個人的な共感や情熱は限定的' },
          { score: 3, label: '良好', description: '会社の理念に共感し、その実現に貢献したいという意欲がある' },
          { score: 4, label: '優秀', description: '会社の理念に強く共感し、その実現に向けて主体的に行動する姿勢がある' }
        ]
      }
    ]
  },
  experienced_sales: {
    id: 'experienced_sales',
    name: '中途営業職',
    description: '営業経験者向けポジション',
    evaluationCriteria: [
      {
        id: 'problem_solving',
        name: '問題解決力',
        description: '目的や目標に対して現状を理解してそのGAPを埋める施策を考えて実行できる',
        weight: 10,
        category: '能力経験',
        scoreDescriptions: [
          { score: 1, label: '不十分', description: '現状把握が不十分で、具体的な解決策を立案できない' },
          { score: 2, label: 'やや不十分', description: '基本的な現状分析はできるが、効果的な解決策の立案に課題がある' },
          { score: 3, label: '良好', description: '現状と目標のギャップを理解し、実現可能な解決策を考えられる' },
          { score: 4, label: '優秀', description: '複雑な問題も構造化して分析し、創造的で実効性の高い解決策を立案・実行できる' }
        ]
      },
      {
        id: 'communication',
        name: 'コミュニケーション能力',
        description: '傾聴力があり、情報や価値観や捉え方の観点で相手とのズレを認識でき、数字とストーリに基づいて伝達できる',
        weight: 10,
        category: '能力経験',
        scoreDescriptions: [
          { score: 1, label: '不十分', description: '一方的な会話になりがちで、相手の立場や考えを理解することが困難' },
          { score: 2, label: 'やや不十分', description: '基本的な会話はできるが、深い理解や効果的な伝達に課題' },
          { score: 3, label: '良好', description: '相手の話を聞き、理解した上で適切に自分の考えを伝えられる' },
          { score: 4, label: '優秀', description: '高い傾聴力で相手を理解し、データとストーリーを使って説得力のある伝達ができる' }
        ]
      }
    ]
  },
  specialist: {
    id: 'specialist',
    name: '中途専門職',
    description: '専門スキルを要求される職種',
    evaluationCriteria: [
      {
        id: 'problem_identification',
        name: '問いの抑え力',
        description: '目的の設定にこだわり目的に立ち返り、手段と目的を逆転させず意思決定をする習慣がある',
        weight: 10,
        category: '能力経験',
        scoreDescriptions: [
          { score: 1, label: '不十分', description: '目的と手段を混同しがちで、なぜその行動を取るのかの理由が不明確' },
          { score: 2, label: 'やや不十分', description: '基本的な目的意識はあるが、深く掘り下げることは少ない' },
          { score: 3, label: '良好', description: '目的を意識して行動し、手段と目的の区別ができている' },
          { score: 4, label: '優秀', description: '常に「なぜ」「何のために」を問い、本質的な目的を見極めて行動できる' }
        ]
      }
    ]
  },
  engineer: {
    id: 'engineer',
    name: 'エンジニア',
    description: 'ソフトウェア開発エンジニア',
    evaluationCriteria: [
      {
        id: 'logical_thinking',
        name: '論理的思考力',
        description: 'ファクトと主観を切り分けて自らの主張を根拠を持って構築できる',
        weight: 11,
        category: '能力経験',
        scoreDescriptions: [
          { score: 1, label: '不十分', description: '事実と意見を混同し、根拠のない主張をしがち' },
          { score: 2, label: 'やや不十分', description: '基本的な論理構成はできるが、根拠が弱い場合がある' },
          { score: 3, label: '良好', description: '事実に基づいて論理的に主張を組み立てることができる' },
          { score: 4, label: '優秀', description: '複雑な情報も整理し、説得力のある論理的な主張を明確に構築できる' }
        ]
      }
    ]
  },
  part_time_base: {
    id: 'part_time_base',
    name: 'アルバイト（拠点）',
    description: '拠点業務を担当するアルバイトスタッフ',
    evaluationCriteria: [
      {
        id: 'basic_communication',
        name: '基本的コミュニケーション',
        description: '顧客や同僚と円滑にコミュニケーションが取れる',
        weight: 15,
        category: '能力経験',
        scoreDescriptions: [
          { score: 1, label: '不十分', description: '基本的な挨拶や会話に課題がある' },
          { score: 2, label: 'やや不十分', description: '簡単な会話はできるが、複雑な内容の伝達に課題' },
          { score: 3, label: '良好', description: '日常的な業務コミュニケーションが適切にできる' },
          { score: 4, label: '優秀', description: '様々な相手と効果的にコミュニケーションを取り、良好な関係を築ける' }
        ]
      }
    ]
  },
  part_time_sales: {
    id: 'part_time_sales',
    name: 'アルバイト（営業）',
    description: '営業サポートを担当するアルバイトスタッフ',
    evaluationCriteria: [
      {
        id: 'sales_communication',
        name: '営業コミュニケーション',
        description: '顧客との会話で信頼関係を築ける',
        weight: 18,
        category: '能力経験',
        scoreDescriptions: [
          { score: 1, label: '不十分', description: '顧客との基本的な会話に課題がある' },
          { score: 2, label: 'やや不十分', description: '簡単な営業会話はできるが、信頼関係構築に課題' },
          { score: 3, label: '良好', description: '顧客と適切にコミュニケーションを取り、基本的な信頼関係を築ける' },
          { score: 4, label: '優秀', description: '顧客との深い信頼関係を築き、営業成果に貢献できる' }
        ]
      }
    ]
  },
  finance_accounting: {
    id: 'finance_accounting',
    name: '財務経理部',
    description: '財務・経理業務の専門職',
    evaluationCriteria: [
      {
        id: 'financial_analysis',
        name: '財務分析力',
        description: '財務諸表の分析や財務指標の理解・活用ができる',
        weight: 12,
        category: '能力経験',
        scoreDescriptions: [
          { score: 1, label: '不十分', description: '基本的な財務諸表の読み方に課題がある' },
          { score: 2, label: 'やや不十分', description: '基本的な財務分析はできるが、深い洞察に課題' },
          { score: 3, label: '良好', description: '財務諸表を適切に分析し、基本的な財務指標を理解できる' },
          { score: 4, label: '優秀', description: '高度な財務分析を行い、経営判断に有用な洞察を提供できる' }
        ]
      }
    ]
  },
  human_resources: {
    id: 'human_resources',
    name: '人事部',
    description: '人事・人材開発の専門職',
    evaluationCriteria: [
      {
        id: 'people_management',
        name: '人材マネジメント力',
        description: '採用・育成・評価等の人事業務を戦略的に推進できる',
        weight: 12,
        category: '能力経験',
        scoreDescriptions: [
          { score: 1, label: '不十分', description: '基本的な人事業務の理解に課題がある' },
          { score: 2, label: 'やや不十分', description: '基本的な人事業務はできるが、戦略的視点に課題' },
          { score: 3, label: '良好', description: '人事業務を適切に推進し、基本的な戦略的視点を持てる' },
          { score: 4, label: '優秀', description: '高度な人材マネジメントを行い、組織戦略に大きく貢献できる' }
        ]
      }
    ]
  },
  business_development: {
    id: 'business_development',
    name: '事業開発部',
    description: '新規事業開発・戦略企画の専門職',
    evaluationCriteria: [
      {
        id: 'strategic_thinking',
        name: '戦略的思考力',
        description: '市場分析から事業戦略を立案し、実行計画に落とし込める',
        weight: 12,
        category: '能力経験',
        scoreDescriptions: [
          { score: 1, label: '不十分', description: '基本的な戦略思考に課題がある' },
          { score: 2, label: 'やや不十分', description: '基本的な戦略立案はできるが、実行計画に課題' },
          { score: 3, label: '良好', description: '適切な戦略立案と実行計画の策定ができる' },
          { score: 4, label: '優秀', description: '高度な戦略思考で革新的な事業戦略を立案・実行できる' }
        ]
      }
    ]
  },
  marketing: {
    id: 'marketing',
    name: 'マーケター',
    description: 'マーケティング・ブランディングの専門職',
    evaluationCriteria: [
      {
        id: 'marketing_strategy',
        name: 'マーケティング戦略立案',
        description: '市場分析に基づいた効果的なマーケティング戦略を立案できる',
        weight: 12,
        category: '能力経験',
        scoreDescriptions: [
          { score: 1, label: '不十分', description: '基本的なマーケティング戦略の理解に課題がある' },
          { score: 2, label: 'やや不十分', description: '基本的な戦略立案はできるが、市場分析に課題' },
          { score: 3, label: '良好', description: '適切な市場分析に基づいたマーケティング戦略を立案できる' },
          { score: 4, label: '優秀', description: '高度な市場洞察に基づいた革新的なマーケティング戦略を立案できる' }
        ]
      }
    ]
  }
};

export const getJobTypeConfigSync = (jobType: JobType): JobTypeConfig => {
  const stored = getStoredCriteria();
  if (stored && stored[jobType]) {
    return stored[jobType];
  }
  return DEFAULT_CRITERIA[jobType];
};

export const getAllJobTypesSync = (): JobTypeConfig[] => {
  const stored = getStoredCriteria();
  if (stored) {
    return Object.values(stored);
  }
  return Object.values(DEFAULT_CRITERIA);
};

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