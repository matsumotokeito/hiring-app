import { CompanyInfo, EvaluationCriterion } from '../types';

const STORAGE_KEY = 'hr_tool_company_info';

// 会社情報の保存・取得
export const saveCompanyInfo = (companyInfo: CompanyInfo): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(companyInfo));
};

export const getCompanyInfo = (): CompanyInfo | null => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return null;
  
  try {
    const companyInfo = JSON.parse(data);
    return {
      ...companyInfo,
      updatedAt: new Date(companyInfo.updatedAt),
    };
  } catch {
    return null;
  }
};

// デフォルトの会社情報を作成
export const createDefaultCompanyInfo = (userId: string, userName: string): CompanyInfo => {
  return {
    id: 'default_company_info',
    companyName: '株式会社サンプル',
    mission: '顧客の課題解決を通じて社会に貢献する',
    vision: '業界のリーディングカンパニーとして持続的成長を実現する',
    values: [
      '顧客第一',
      'チームワーク',
      '継続的改善',
      '誠実性',
      'イノベーション'
    ],
    culture: 'チャレンジ精神を重視し、失敗を恐れずに挑戦できる環境。多様性を尊重し、個人の成長と会社の発展を両立する。',
    behavioralGuidelines: [
      '常に顧客の立場に立って考える',
      'チーム全体の成功を優先する',
      '積極的にコミュニケーションを取る',
      '継続的な学習と改善を心がける',
      '誠実で透明性のある行動を取る'
    ],
    evaluationPhilosophy: '個人の能力だけでなく、組織への貢献度、成長意欲、価値観の適合性を総合的に評価する。短期的な成果だけでなく、長期的なポテンシャルも重視する。',
    hiringCriteria: [
      '企業理念への共感',
      '成長意欲と学習能力',
      'チームワークとコミュニケーション能力',
      '問題解決能力と論理的思考',
      '責任感と誠実性'
    ],
    workEnvironment: 'フラットな組織構造で、年齢や役職に関係なく意見を言い合える環境。リモートワークとオフィスワークのハイブリッド型勤務を推進。',
    leadershipStyle: 'サーバントリーダーシップを重視し、メンバーの成長を支援するリーダーを求める。指示命令型ではなく、コーチング型のマネジメントを推奨。',
    teamDynamics: '多様なバックグラウンドを持つメンバーが協力し、互いの強みを活かしながら目標達成を目指す。心理的安全性を重視し、建設的な議論を促進。',
    performanceExpectations: '明確な目標設定と定期的なフィードバックを通じて、継続的な成長を支援。結果だけでなく、プロセスや取り組み姿勢も評価対象とする。',
    careerDevelopment: '個人のキャリア目標に応じた成長機会を提供。社内外の研修、メンタリング制度、ジョブローテーションなどを通じてスキルアップを支援。',
    diversityInclusion: '性別、年齢、国籍、バックグラウンドに関係なく、多様な人材が活躍できる環境を整備。インクルーシブな文化の醸成を重視。',
    additionalContext: '急速に変化する市場環境に対応するため、柔軟性と適応力を持つ人材を求めている。新しい技術やトレンドに敏感で、変化を楽しめる人材を歓迎。',
    updatedAt: new Date(),
    updatedBy: userId,
    // デフォルトの評価基準を追加
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
        id: 'problem_solving',
        name: '問いの解決力',
        description: '目的や目標に対して現状を理解してそのGAPを埋める施策を考えて実行できる',
        weight: 8,
        category: '能力経験',
        scoreDescriptions: [
          { score: 1, label: '不十分', description: '現状把握が不十分で、具体的な解決策を立案できない' },
          { score: 2, label: 'やや不十分', description: '基本的な現状分析はできるが、効果的な解決策の立案に課題がある' },
          { score: 3, label: '良好', description: '現状と目標のギャップを理解し、実現可能な解決策を考えられる' },
          { score: 4, label: '優秀', description: '複雑な問題も構造化して分析し、創造的で実効性の高い解決策を立案・実行できる' }
        ]
      },
      {
        id: 'persistence',
        name: 'やり切り力',
        description: '年単位で目標を設定し努力を経て困難な目標を達成した経験がある人',
        weight: 8,
        category: '能力経験',
        scoreDescriptions: [
          { score: 1, label: '不十分', description: '短期的な目標設定が中心で、困難に直面すると諦めがち' },
          { score: 2, label: 'やや不十分', description: '中期的な目標は設定できるが、困難な状況での継続に課題' },
          { score: 3, label: '良好', description: '年単位の目標を設定し、ある程度の困難は乗り越えて達成できる' },
          { score: 4, label: '優秀', description: '長期的で困難な目標でも、計画的に努力を継続し確実に達成する実績がある' }
        ]
      },
      {
        id: 'logical_thinking',
        name: '論理力',
        description: 'ファクトと主観を切り分けて自らの主張を根拠を持って構築できる（国語力）',
        weight: 7,
        category: '能力経験',
        scoreDescriptions: [
          { score: 1, label: '不十分', description: '事実と意見を混同し、根拠のない主張をしがち' },
          { score: 2, label: 'やや不十分', description: '基本的な論理構成はできるが、根拠が弱い場合がある' },
          { score: 3, label: '良好', description: '事実に基づいて論理的に主張を組み立てることができる' },
          { score: 4, label: '優秀', description: '複雑な情報も整理し、説得力のある論理的な主張を明確に構築できる' }
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
        id: 'self_responsibility',
        name: '自責思考',
        description: '物事の原因に関してまず自分の改良の余地を探す',
        weight: 8,
        category: '価値観',
        scoreDescriptions: [
          { score: 1, label: '不十分', description: '問題の原因を他者や環境に求める傾向が強い' },
          { score: 2, label: 'やや不十分', description: '時々自分の責任を認めるが、他責思考になることも多い' },
          { score: 3, label: '良好', description: '問題発生時に自分の改善点を考える習慣がある' },
          { score: 4, label: '優秀', description: 'どんな状況でも自分の改善余地を積極的に探し、建設的な解決策を提案できる' }
        ]
      },
      {
        id: 'intellectual_curiosity',
        name: '知的好奇心',
        description: '知的好奇心が強く自分で情報をインプットすることが習慣化している',
        weight: 6,
        category: '価値観',
        scoreDescriptions: [
          { score: 1, label: '不十分', description: '新しい知識への関心が低く、自発的な学習習慣がない' },
          { score: 2, label: 'やや不十分', description: '興味のある分野には関心を示すが、幅広い学習意欲に欠ける' },
          { score: 3, label: '良好', description: '様々な分野に関心を持ち、定期的に新しい知識を得ている' },
          { score: 4, label: '優秀', description: '強い知的好奇心を持ち、多様な分野で継続的な学習が習慣化している' }
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
      },
      {
        id: 'win_win_potential',
        name: 'WIN-WINになれるか',
        description: '会社が提供できる環境と本人が希望する働く上での軸やキャリアプランが長期的に考えてマッチするか（そうでないと人はやめる）',
        weight: 9,
        category: '志向性',
        scoreDescriptions: [
          { score: 1, label: '不十分', description: '希望するキャリアと会社の提供環境に大きなミスマッチがある' },
          { score: 2, label: 'やや不十分', description: '部分的に合致しているが、長期的には課題がある可能性' },
          { score: 3, label: '良好', description: '希望するキャリアと会社環境が概ね合致している' },
          { score: 4, label: '優秀', description: '希望するキャリアと会社環境が完全に一致し、長期的な相互成長が期待できる' }
        ]
      }
    ]
  };
};

// 会社情報が存在しない場合のデフォルト作成
export const ensureCompanyInfoExists = (userId: string, userName: string): CompanyInfo => {
  let companyInfo = getCompanyInfo();
  if (!companyInfo) {
    companyInfo = createDefaultCompanyInfo(userId, userName);
    saveCompanyInfo(companyInfo);
  }
  return companyInfo;
};

// 評価基準の保存・取得
export const saveEvaluationCriteria = (criteria: EvaluationCriterion[]): void => {
  const companyInfo = getCompanyInfo();
  if (companyInfo) {
    companyInfo.evaluationCriteria = criteria;
    companyInfo.updatedAt = new Date();
    saveCompanyInfo(companyInfo);
  }
};

export const getEvaluationCriteria = (): EvaluationCriterion[] => {
  const companyInfo = getCompanyInfo();
  return companyInfo?.evaluationCriteria || [];
};