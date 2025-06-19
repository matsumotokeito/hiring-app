import { JobPosting, JobType } from '../types';

const STORAGE_KEY = 'hr_tool_job_postings';

// 求人票データの保存・取得
export const saveJobPostings = (jobPostings: JobPosting[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(jobPostings));
};

export const getJobPostings = (): JobPosting[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  
  try {
    const jobPostings = JSON.parse(data);
    return jobPostings.map((jp: any) => ({
      ...jp,
      applicationDeadline: jp.applicationDeadline ? new Date(jp.applicationDeadline) : undefined,
      startDate: jp.startDate ? new Date(jp.startDate) : undefined,
      createdAt: new Date(jp.createdAt),
      updatedAt: new Date(jp.updatedAt),
      // 新しいフィールドのデフォルト値を設定
      essentialRequirements: jp.essentialRequirements || [],
      preferredRequirements: jp.preferredRequirements || [],
      idealCandidate: jp.idealCandidate || [],
    }));
  } catch {
    return [];
  }
};

export const saveJobPosting = (jobPosting: JobPosting): void => {
  const jobPostings = getJobPostings();
  const existingIndex = jobPostings.findIndex(jp => jp.id === jobPosting.id);
  
  if (existingIndex >= 0) {
    jobPostings[existingIndex] = { ...jobPosting, updatedAt: new Date() };
  } else {
    jobPostings.push(jobPosting);
  }
  
  saveJobPostings(jobPostings);
};

export const getJobPostingByJobType = (jobType: JobType): JobPosting | null => {
  const jobPostings = getJobPostings();
  return jobPostings.find(jp => jp.jobType === jobType && jp.isActive) || null;
};

export const deleteJobPosting = (jobPostingId: string): void => {
  const jobPostings = getJobPostings().filter(jp => jp.id !== jobPostingId);
  saveJobPostings(jobPostings);
};

export const getActiveJobPostings = (): JobPosting[] => {
  return getJobPostings().filter(jp => jp.isActive);
};

// デフォルトの求人票データを作成
export const createDefaultJobPostings = (): void => {
  const existingPostings = getJobPostings();
  if (existingPostings.length > 0) return; // 既にデータがある場合は作成しない

  const defaultPostings: JobPosting[] = [
    {
      id: 'fresh_sales_default',
      jobType: 'fresh_sales',
      title: '新卒営業職',
      department: '営業部',
      location: '東京本社',
      employmentType: 'full-time',
      salaryRange: {
        min: 250000,
        max: 300000,
        currency: 'JPY'
      },
      requirements: {
        education: ['大学卒業以上'],
        experience: ['営業経験不問', '新卒歓迎'],
        skills: ['コミュニケーション能力', 'プレゼンテーション能力', 'Microsoft Office'],
        qualifications: ['普通自動車免許歓迎'],
        languages: ['日本語（ネイティブレベル）']
      },
      // 新しく追加する要件
      essentialRequirements: [
        '大学卒業以上の学歴',
        '基本的なコミュニケーション能力',
        '営業職への強い意欲',
        '目標達成に向けた継続的な努力ができること',
        '顧客第一の考え方を持てること'
      ],
      preferredRequirements: [
        '営業・接客のアルバイト経験',
        '体育会系の部活動経験',
        '学生時代のリーダー経験',
        '普通自動車免許',
        'TOEIC600点以上',
        'Microsoft Office（Word、Excel、PowerPoint）の基本操作'
      ],
      idealCandidate: [
        '積極的で前向きな性格',
        '困難な状況でも諦めずに取り組める粘り強さ',
        'チームワークを大切にし、周囲と協力できる',
        '学習意欲が高く、成長への意識が強い',
        '顧客の立場に立って考えられる共感力',
        '目標に向かって計画的に行動できる',
        '新しいことにチャレンジする意欲がある'
      ],
      responsibilities: [
        '新規顧客開拓',
        '既存顧客のフォローアップ',
        '提案書作成・プレゼンテーション',
        '契約締結・アフターフォロー',
        '営業目標の達成'
      ],
      benefits: [
        '社会保険完備',
        '交通費支給',
        '賞与年2回',
        '各種研修制度',
        '資格取得支援'
      ],
      workingConditions: {
        workingHours: '9:00-18:00（実働8時間）',
        holidays: '土日祝日、年末年始、夏季休暇',
        overtime: '月平均20時間程度',
        remoteWork: false,
        travelRequired: true
      },
      companyInfo: {
        mission: '顧客の課題解決を通じて社会に貢献する',
        vision: '業界のリーディングカンパニーとして持続的成長を実現する',
        values: ['顧客第一', 'チームワーク', '継続的改善', '誠実性'],
        culture: 'チャレンジ精神を重視し、失敗を恐れずに挑戦できる環境'
      },
      careerPath: {
        initialRole: 'ジュニア営業',
        growthOpportunities: ['シニア営業', 'チームリーダー', 'マネージャー', '事業部長'],
        trainingPrograms: ['新人研修', '営業スキル研修', 'リーダーシップ研修', 'マネジメント研修']
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'system'
    },
    {
      id: 'experienced_sales_default',
      jobType: 'experienced_sales',
      title: '中途営業職（経験者）',
      department: '営業部',
      location: '東京本社・大阪支社',
      employmentType: 'full-time',
      salaryRange: {
        min: 350000,
        max: 600000,
        currency: 'JPY'
      },
      requirements: {
        education: ['大学卒業以上'],
        experience: ['営業経験3年以上', 'B2B営業経験必須'],
        skills: ['顧客折衝能力', '提案力', '課題解決能力', 'データ分析能力'],
        qualifications: ['普通自動車免許'],
        languages: ['日本語（ネイティブレベル）', '英語（ビジネスレベル歓迎）']
      },
      essentialRequirements: [
        'B2B営業経験3年以上',
        '年間売上目標達成の実績',
        '顧客との信頼関係構築能力',
        '提案型営業の経験',
        '基本的なPCスキル（Excel、PowerPoint等）'
      ],
      preferredRequirements: [
        '同業界での営業経験',
        'チームマネジメント経験',
        '新規開拓営業の実績',
        '大手企業との取引経験',
        'TOEIC700点以上',
        '営業関連資格（営業士等）'
      ],
      idealCandidate: [
        '高い目標意識と達成への執念',
        '顧客の課題を深く理解し解決策を提案できる',
        '変化する市場環境に柔軟に対応できる',
        '後輩指導やチーム貢献への意識が高い',
        '継続的な自己研鑽を怠らない',
        '論理的思考力と説得力を兼ね備えている',
        '長期的な視点で顧客関係を構築できる'
      ],
      responsibilities: [
        '大手企業への新規開拓',
        '既存顧客の深耕・拡大',
        '戦略的提案の企画・実行',
        'チームメンバーの指導・育成',
        '売上目標の達成・管理'
      ],
      benefits: [
        '社会保険完備',
        '交通費支給',
        '賞与年2回',
        '成果報酬制度',
        '株式報酬制度',
        '各種研修制度'
      ],
      workingConditions: {
        workingHours: '9:00-18:00（フレックスタイム制）',
        holidays: '土日祝日、年末年始、夏季休暇',
        overtime: '月平均30時間程度',
        remoteWork: true,
        travelRequired: true
      },
      companyInfo: {
        mission: '顧客の課題解決を通じて社会に貢献する',
        vision: '業界のリーディングカンパニーとして持続的成長を実現する',
        values: ['顧客第一', 'チームワーク', '継続的改善', '誠実性'],
        culture: '実力主義で成果を正当に評価し、キャリアアップを支援する環境'
      },
      careerPath: {
        initialRole: 'シニア営業',
        growthOpportunities: ['チームリーダー', 'マネージャー', '事業部長', '執行役員'],
        trainingPrograms: ['中途入社者研修', 'リーダーシップ研修', 'マネジメント研修', '戦略企画研修']
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'system'
    },
    {
      id: 'specialist_default',
      jobType: 'specialist',
      title: '専門職（コンサルタント）',
      department: 'コンサルティング部',
      location: '東京本社',
      employmentType: 'full-time',
      salaryRange: {
        min: 500000,
        max: 800000,
        currency: 'JPY'
      },
      requirements: {
        education: ['大学院卒業以上歓迎'],
        experience: ['コンサルティング経験5年以上', '業界知識必須'],
        skills: ['戦略立案能力', 'プロジェクトマネジメント', 'データ分析', 'ファシリテーション'],
        qualifications: ['MBA歓迎', '各種資格歓迎'],
        languages: ['日本語（ネイティブレベル）', '英語（ビジネスレベル必須）']
      },
      essentialRequirements: [
        'コンサルティング業務経験5年以上',
        '戦略立案・実行支援の実績',
        'プロジェクトマネジメント経験',
        '高度な分析・論理思考力',
        'ビジネスレベルの英語力'
      ],
      preferredRequirements: [
        'MBA取得者',
        '同業界でのコンサルティング経験',
        'デジタル変革プロジェクトの経験',
        '海外プロジェクトの経験',
        '公認会計士・中小企業診断士等の資格',
        'チームリーダー・マネジメント経験'
      ],
      idealCandidate: [
        '複雑な課題を構造化して解決できる',
        '顧客の立場に立って最適解を追求する',
        '高い専門性と幅広い視野を持つ',
        'チームを牽引するリーダーシップがある',
        '継続的な学習と自己成長への意欲が強い',
        '変化を楽しみ新しい挑戦を歓迎する',
        '誠実で信頼される人格を持つ'
      ],
      responsibilities: [
        '顧客の経営課題分析',
        '戦略立案・実行支援',
        'プロジェクトマネジメント',
        'チームリーダーとしての指導',
        '新規サービス開発'
      ],
      benefits: [
        '社会保険完備',
        '交通費支給',
        '賞与年2回',
        '成果報酬制度',
        '株式報酬制度',
        '書籍購入支援',
        '学会参加支援'
      ],
      workingConditions: {
        workingHours: '9:00-18:00（フレックスタイム制）',
        holidays: '土日祝日、年末年始、夏季休暇',
        overtime: 'プロジェクトにより変動',
        remoteWork: true,
        travelRequired: true
      },
      companyInfo: {
        mission: '顧客の課題解決を通じて社会に貢献する',
        vision: '業界のリーディングカンパニーとして持続的成長を実現する',
        values: ['顧客第一', 'チームワーク', '継続的改善', '誠実性'],
        culture: '専門性を重視し、個人の成長と会社の発展を両立する環境'
      },
      careerPath: {
        initialRole: 'シニアコンサルタント',
        growthOpportunities: ['プリンシパル', 'パートナー', '事業部長', '執行役員'],
        trainingPrograms: ['専門スキル研修', 'リーダーシップ研修', 'マネジメント研修', '海外研修']
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'system'
    },
    {
      id: 'engineer_default',
      jobType: 'engineer',
      title: 'ソフトウェアエンジニア',
      department: '開発部',
      location: '東京本社',
      employmentType: 'full-time',
      salaryRange: {
        min: 400000,
        max: 700000,
        currency: 'JPY'
      },
      requirements: {
        education: ['大学卒業以上'],
        experience: ['ソフトウェア開発経験3年以上'],
        skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'データベース設計'],
        qualifications: ['各種技術資格歓迎'],
        languages: ['日本語（ネイティブレベル）', '英語（技術文書読解レベル）']
      },
      essentialRequirements: [
        'Webアプリケーション開発経験3年以上',
        'JavaScript/TypeScriptでの開発経験',
        'フロントエンド・バックエンド両方の開発経験',
        'Git等のバージョン管理システムの使用経験',
        'チーム開発の経験'
      ],
      preferredRequirements: [
        'React/Vue.js等のモダンフレームワーク経験',
        'AWS/Azure等のクラウドサービス経験',
        'Docker/Kubernetes等のコンテナ技術経験',
        'CI/CD環境の構築・運用経験',
        'アジャイル開発の経験',
        'テスト駆動開発（TDD）の経験'
      ],
      idealCandidate: [
        '新しい技術への学習意欲が高い',
        '品質の高いコードを書くことにこだわりがある',
        'チームメンバーと協力して開発を進められる',
        '課題解決に向けて論理的にアプローチできる',
        'ユーザー視点でサービスを考えられる',
        '継続的な改善・最適化への意識が高い',
        '技術的な議論を建設的に行える'
      ],
      responsibilities: [
        'Webアプリケーション開発',
        'システム設計・アーキテクチャ検討',
        'コードレビュー・品質管理',
        '技術選定・導入',
        'チームメンバーの技術指導'
      ],
      benefits: [
        '社会保険完備',
        '交通費支給',
        '賞与年2回',
        '技術書購入支援',
        'カンファレンス参加支援',
        '資格取得支援',
        '最新機器貸与'
      ],
      workingConditions: {
        workingHours: '10:00-19:00（フレックスタイム制）',
        holidays: '土日祝日、年末年始、夏季休暇',
        overtime: '月平均20時間程度',
        remoteWork: true,
        travelRequired: false
      },
      companyInfo: {
        mission: '顧客の課題解決を通じて社会に貢献する',
        vision: '業界のリーディングカンパニーとして持続的成長を実現する',
        values: ['顧客第一', 'チームワーク', '継続的改善', '誠実性'],
        culture: '技術力を重視し、最新技術への挑戦を推奨する環境'
      },
      careerPath: {
        initialRole: 'ソフトウェアエンジニア',
        growthOpportunities: ['シニアエンジニア', 'テックリード', 'エンジニアリングマネージャー', 'CTO'],
        trainingPrograms: ['技術研修', 'アーキテクチャ研修', 'マネジメント研修', '海外技術カンファレンス']
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'system'
    },
    {
      id: 'part_time_base_default',
      jobType: 'part_time_base',
      title: 'アルバイトスタッフ（店舗・拠点）',
      department: '店舗運営部',
      location: '各店舗・拠点',
      employmentType: 'part-time',
      salaryRange: {
        min: 1000,
        max: 1500,
        currency: 'JPY'
      },
      requirements: {
        education: ['高校卒業以上'],
        experience: ['未経験歓迎', '接客経験歓迎'],
        skills: ['基本的なコミュニケーション能力', '丁寧な接客態度'],
        qualifications: ['特になし'],
        languages: ['日本語（日常会話レベル以上）']
      },
      essentialRequirements: [
        '基本的なコミュニケーション能力',
        '丁寧で親切な接客態度',
        '責任感を持って業務に取り組める',
        'シフト制勤務に対応できる',
        '基本的なマナーを身につけている'
      ],
      preferredRequirements: [
        '接客・販売の経験',
        'レジ操作の経験',
        '小売業界での勤務経験',
        '外国語での基本的なコミュニケーション能力',
        '商品知識への学習意欲'
      ],
      idealCandidate: [
        '明るく親しみやすい人柄',
        'お客様第一の考え方ができる',
        'チームワークを大切にできる',
        '細かい作業も丁寧に行える',
        '学習意欲があり成長したい気持ちがある',
        '柔軟性があり変化に対応できる',
        '誠実で信頼できる人格'
      ],
      responsibilities: [
        '店舗での接客・販売',
        'レジ業務・会計処理',
        '商品陳列・在庫管理',
        '店舗清掃・環境整備',
        '電話対応・問い合わせ対応'
      ],
      benefits: [
        '労災保険加入',
        '交通費支給（上限あり）',
        '制服貸与',
        '社員割引制度',
        '研修制度'
      ],
      workingConditions: {
        workingHours: 'シフト制（8:00-22:00の間で4-8時間）',
        holidays: 'シフトによる',
        overtime: '基本的になし',
        remoteWork: false,
        travelRequired: false
      },
      companyInfo: {
        mission: '顧客の課題解決を通じて社会に貢献する',
        vision: '業界のリーディングカンパニーとして持続的成長を実現する',
        values: ['顧客第一', 'チームワーク', '継続的改善', '誠実性'],
        culture: 'アットホームで働きやすい環境を重視し、スタッフの成長を支援'
      },
      careerPath: {
        initialRole: 'アルバイトスタッフ',
        growthOpportunities: ['リーダー', '副店長', '店長', '正社員登用'],
        trainingPrograms: ['新人研修', '接客マナー研修', 'リーダー研修']
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'system'
    },
    {
      id: 'part_time_sales_default',
      jobType: 'part_time_sales',
      title: 'アルバイトスタッフ（営業サポート）',
      department: '営業部',
      location: '東京本社・各営業所',
      employmentType: 'part-time',
      salaryRange: {
        min: 1200,
        max: 1800,
        currency: 'JPY'
      },
      requirements: {
        education: ['高校卒業以上'],
        experience: ['未経験歓迎', 'テレアポ・営業経験歓迎'],
        skills: ['電話対応能力', '基本的なPC操作', 'コミュニケーション能力'],
        qualifications: ['特になし'],
        languages: ['日本語（ビジネス会話レベル）']
      },
      essentialRequirements: [
        '基本的な電話対応能力',
        'PC操作（Word、Excel基本操作）',
        'ビジネスマナーの基礎知識',
        '営業サポート業務への意欲',
        'シフト制勤務に対応できる'
      ],
      preferredRequirements: [
        'テレアポ・電話営業の経験',
        '営業事務の経験',
        'CRM・SFAツールの使用経験',
        '営業職への将来的な興味',
        'データ入力・管理の経験'
      ],
      idealCandidate: [
        '営業職に興味があり将来性を感じる',
        '目標達成への意識が高い',
        'コミュニケーションを取ることが好き',
        '細かい作業も正確に行える',
        '向上心があり積極的に学ぼうとする',
        'チームの一員として貢献したい気持ちがある',
        '粘り強く継続的に取り組める'
      ],
      responsibilities: [
        'テレアポ・電話営業',
        '営業資料の作成補助',
        '顧客データ入力・管理',
        'アポイント調整・スケジュール管理',
        '営業チームのサポート業務'
      ],
      benefits: [
        '労災保険加入',
        '交通費支給（上限あり）',
        '成果インセンティブ',
        '正社員登用制度',
        '営業スキル研修'
      ],
      workingConditions: {
        workingHours: 'シフト制（9:00-18:00の間で4-6時間）',
        holidays: 'シフトによる（土日祝休み相談可）',
        overtime: '基本的になし',
        remoteWork: false,
        travelRequired: false
      },
      companyInfo: {
        mission: '顧客の課題解決を通じて社会に貢献する',
        vision: '業界のリーディングカンパニーとして持続的成長を実現する',
        values: ['顧客第一', 'チームワーク', '継続的改善', '誠実性'],
        culture: '成果を正当に評価し、営業スキルの向上を支援する環境'
      },
      careerPath: {
        initialRole: '営業サポートスタッフ',
        growthOpportunities: ['営業アシスタント', '営業職', '正社員登用'],
        trainingPrograms: ['営業基礎研修', '電話応対研修', 'ビジネスマナー研修']
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'system'
    },
    // 新しく追加する専門職のデフォルト求人票
    {
      id: 'finance_accounting_default',
      jobType: 'finance_accounting',
      title: '財務経理スペシャリスト',
      department: '財務経理部',
      location: '東京本社',
      employmentType: 'full-time',
      salaryRange: {
        min: 450000,
        max: 750000,
        currency: 'JPY'
      },
      requirements: {
        education: ['大学卒業以上', '会計・財務専攻歓迎'],
        experience: ['財務・経理経験3年以上'],
        skills: ['財務分析', '会計ソフト操作', 'Excel高度活用', '決算業務'],
        qualifications: ['公認会計士・税理士資格歓迎', '日商簿記検定2級以上'],
        languages: ['日本語（ネイティブレベル）', '英語（ビジネスレベル歓迎）']
      },
      essentialRequirements: [
        '財務・経理業務経験3年以上',
        '決算業務の実務経験',
        '会計ソフトの操作経験',
        'Excelの高度な活用スキル',
        '日商簿記検定2級以上または同等の知識'
      ],
      preferredRequirements: [
        '公認会計士・税理士資格保有者',
        '上場企業での経理経験',
        'IFRS・米国会計基準の知識',
        '連結決算の経験',
        '英語でのコミュニケーション能力',
        '財務戦略立案の経験'
      ],
      idealCandidate: [
        '高い正確性と細部への注意力を持つ',
        '数字に強く分析力がある',
        '期日を守り責任感を持って業務に取り組める',
        '継続的な学習意欲があり会計制度の変更に対応できる',
        '関係部署と円滑にコミュニケーションが取れる',
        '業務改善や効率化への意識が高い',
        '誠実で高い倫理観を持つ'
      ],
      responsibilities: [
        '月次・四半期・年次決算業務',
        '財務諸表作成・分析',
        '税務申告書類の作成',
        '予算管理・資金管理',
        '監査対応',
        '経営陣への財務報告'
      ],
      benefits: [
        '社会保険完備',
        '交通費支給',
        '賞与年2回',
        '資格取得支援制度',
        '確定拠出年金制度',
        '財務・会計セミナー参加支援'
      ],
      workingConditions: {
        workingHours: '9:00-18:00（フレックスタイム制）',
        holidays: '土日祝日、年末年始、夏季休暇',
        overtime: '月平均20-30時間（決算期は増加）',
        remoteWork: true,
        travelRequired: false
      },
      companyInfo: {
        mission: '顧客の課題解決を通じて社会に貢献する',
        vision: '業界のリーディングカンパニーとして持続的成長を実現する',
        values: ['正確性', '透明性', '誠実性', '継続的改善'],
        culture: '専門性を重視し、正確で透明性の高い財務報告を大切にする環境'
      },
      careerPath: {
        initialRole: '財務経理スペシャリスト',
        growthOpportunities: ['シニアアカウンタント', '財務マネージャー', '経理部長', 'CFO'],
        trainingPrograms: ['会計基準研修', '税務研修', 'マネジメント研修', '財務戦略研修']
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'system'
    },
    {
      id: 'human_resources_default',
      jobType: 'human_resources',
      title: '人事スペシャリスト',
      department: '人事部',
      location: '東京本社',
      employmentType: 'full-time',
      salaryRange: {
        min: 400000,
        max: 700000,
        currency: 'JPY'
      },
      requirements: {
        education: ['大学卒業以上'],
        experience: ['人事業務経験3年以上'],
        skills: ['採用活動', '人材育成', '労務管理', 'HR企画'],
        qualifications: ['社会保険労務士資格歓迎', '人事関連資格歓迎'],
        languages: ['日本語（ネイティブレベル）']
      },
      essentialRequirements: [
        '人事業務経験3年以上',
        '採用活動の企画・実施経験',
        '人事制度の運用経験',
        '労務管理の基本知識',
        'コミュニケーション能力'
      ],
      preferredRequirements: [
        '社会保険労務士資格',
        '人事評価制度の設計・運用経験',
        '研修企画・実施経験',
        '人事システム導入・運用経験',
        '組織開発の知識・経験',
        '採用広報・ブランディング経験'
      ],
      idealCandidate: [
        '人を大切にする価値観を持っている',
        '公平性と中立性を保ちながら判断できる',
        '高い共感力と傾聴力を持つ',
        '守秘義務を厳守できる誠実さがある',
        '組織と個人の成長を両立させる視点を持つ',
        '変化に柔軟に対応できる適応力がある',
        '多様性を尊重し包括的な組織づくりに貢献できる'
      ],
      responsibilities: [
        '採用活動の企画・実施',
        '人材育成・研修の企画・運営',
        '人事評価制度の運用',
        '労務管理・社会保険手続き',
        '人事制度の企画・改善',
        '社内コミュニケーション活性化'
      ],
      benefits: [
        '社会保険完備',
        '交通費支給',
        '賞与年2回',
        '資格取得支援制度',
        '研修参加支援',
        'フレックスタイム制'
      ],
      workingConditions: {
        workingHours: '9:00-18:00（フレックスタイム制）',
        holidays: '土日祝日、年末年始、夏季休暇',
        overtime: '月平均20時間程度',
        remoteWork: true,
        travelRequired: false
      },
      companyInfo: {
        mission: '人材の力を最大化し、組織の持続的成長に貢献する',
        vision: '社員一人ひとりが活躍できる環境づくりのリーディングカンパニーに',
        values: ['人間尊重', '公平性', '多様性', '継続的成長'],
        culture: '人を大切にし、個人の成長と組織の発展を両立する環境'
      },
      careerPath: {
        initialRole: '人事スペシャリスト',
        growthOpportunities: ['シニア人事', '人事マネージャー', '人事部長', 'CHRO'],
        trainingPrograms: ['人事基礎研修', '労務管理研修', '組織開発研修', 'ダイバーシティ研修']
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'system'
    },
    {
      id: 'business_development_default',
      jobType: 'business_development',
      title: '事業開発マネージャー',
      department: '事業開発部',
      location: '東京本社',
      employmentType: 'full-time',
      salaryRange: {
        min: 500000,
        max: 900000,
        currency: 'JPY'
      },
      requirements: {
        education: ['大学卒業以上', 'MBA歓迎'],
        experience: ['事業開発・企画経験5年以上', 'プロジェクトマネジメント経験'],
        skills: ['事業戦略立案', '市場分析', 'ビジネスモデル構築', 'プレゼンテーション'],
        qualifications: ['MBA・中小企業診断士等歓迎'],
        languages: ['日本語（ネイティブレベル）', '英語（ビジネスレベル必須）']
      },
      essentialRequirements: [
        '事業開発・企画経験5年以上',
        '新規事業の立案から実行までの経験',
        '市場分析・競合分析の実務経験',
        'プロジェクトマネジメント経験',
        '経営層へのプレゼンテーション経験'
      ],
      preferredRequirements: [
        'MBA取得者',
        'スタートアップ経験',
        'M&A・事業提携の経験',
        '海外事業展開の経験',
        'デジタルトランスフォーメーション推進経験',
        '資金調達・投資判断の経験'
      ],
      idealCandidate: [
        '戦略的思考と実行力を兼ね備えている',
        '不確実性の高い環境でも意思決定できる',
        '多様なステークホルダーと協働できる',
        '新しい市場機会を発見する洞察力がある',
        '論理的思考と創造的発想のバランスが取れている',
        '高い目標に挑戦し続ける意欲がある',
        '変化を楽しみ、学び続ける姿勢がある'
      ],
      responsibilities: [
        '新規事業の企画・立案',
        '事業計画の策定・実行',
        '市場調査・競合分析',
        '事業提携・M&A候補の発掘・交渉',
        '経営層への戦略提案',
        '事業KPI管理・PDCAサイクル推進'
      ],
      benefits: [
        '社会保険完備',
        '交通費支給',
        '賞与年2回',
        '業績連動型インセンティブ',
        '株式報酬制度',
        '書籍購入支援',
        '海外カンファレンス参加支援'
      ],
      workingConditions: {
        workingHours: '9:00-18:00（フレックスタイム制）',
        holidays: '土日祝日、年末年始、夏季休暇',
        overtime: '月平均30時間程度',
        remoteWork: true,
        travelRequired: true
      },
      companyInfo: {
        mission: '革新的な事業創造を通じて社会課題を解決する',
        vision: '持続的成長を実現する新規事業を生み出し続ける組織に',
        values: ['挑戦', '創造性', '顧客中心', '実行力'],
        culture: '失敗を恐れず挑戦し、スピード感を持って実行する環境'
      },
      careerPath: {
        initialRole: '事業開発マネージャー',
        growthOpportunities: ['シニアマネージャー', '事業部長', '執行役員', 'CEO'],
        trainingPrograms: ['事業戦略研修', 'イノベーション研修', 'リーダーシップ研修', '海外MBA派遣']
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'system'
    },
    {
      id: 'marketing_default',
      jobType: 'marketing',
      title: 'マーケティングマネージャー',
      department: 'マーケティング部',
      location: '東京本社',
      employmentType: 'full-time',
      salaryRange: {
        min: 450000,
        max: 800000,
        currency: 'JPY'
      },
      requirements: {
        education: ['大学卒業以上'],
        experience: ['マーケティング経験5年以上', 'デジタルマーケティング経験必須'],
        skills: ['マーケティング戦略立案', 'デジタル広告運用', 'コンテンツマーケティング', 'データ分析'],
        qualifications: ['マーケティング関連資格歓迎'],
        languages: ['日本語（ネイティブレベル）', '英語（ビジネスレベル歓迎）']
      },
      essentialRequirements: [
        'マーケティング経験5年以上',
        'デジタルマーケティングの実務経験',
        'マーケティング戦略の立案・実行経験',
        'データ分析に基づく施策立案経験',
        'チームマネジメント経験'
      ],
      preferredRequirements: [
        'BtoBマーケティング経験',
        'マーケティングオートメーションツール活用経験',
        'SEO/SEM施策の実施経験',
        'コンテンツマーケティング戦略立案経験',
        'ブランディング戦略の立案・実行経験',
        'マーケティングROI分析・改善経験'
      ],
      idealCandidate: [
        'データドリブンな意思決定ができる',
        '顧客視点でマーケティング施策を考えられる',
        'トレンドに敏感で新しい手法を積極的に取り入れる',
        '戦略的思考と実行力のバランスが取れている',
        'クリエイティブな発想と論理的思考を併せ持つ',
        '複数のプロジェクトを並行して管理できる',
        '社内外の関係者と効果的にコミュニケーションが取れる'
      ],
      responsibilities: [
        'マーケティング戦略の立案・実行',
        'デジタルマーケティング施策の企画・運用',
        'マーケティングKPI設定・分析・改善',
        'コンテンツ制作ディレクション',
        'マーケティングチームのマネジメント',
        '予算管理・ROI最大化'
      ],
      benefits: [
        '社会保険完備',
        '交通費支給',
        '賞与年2回',
        '成果連動型インセンティブ',
        'マーケティングセミナー参加支援',
        '資格取得支援',
        'フレックスタイム制'
      ],
      workingConditions: {
        workingHours: '9:00-18:00（フレックスタイム制）',
        holidays: '土日祝日、年末年始、夏季休暇',
        overtime: '月平均20時間程度',
        remoteWork: true,
        travelRequired: false
      },
      companyInfo: {
        mission: '革新的なマーケティングで顧客と企業の架け橋となる',
        vision: 'データとクリエイティブの融合で業界をリードするマーケティングを実現',
        values: ['顧客中心', '革新性', 'データ重視', '結果へのこだわり'],
        culture: '常に新しいことに挑戦し、失敗から学び、改善し続ける環境'
      },
      careerPath: {
        initialRole: 'マーケティングマネージャー',
        growthOpportunities: ['シニアマーケティングマネージャー', 'マーケティング部長', 'CMO'],
        trainingPrograms: ['デジタルマーケティング研修', 'データ分析研修', 'リーダーシップ研修', '海外マーケティングカンファレンス']
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'system'
    }
  ];

  saveJobPostings(defaultPostings);
};