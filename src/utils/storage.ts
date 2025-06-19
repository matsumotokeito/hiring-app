import { Candidate, Evaluation, SavedDraft } from '../types';

const STORAGE_KEYS = {
  CANDIDATES: 'hr_tool_candidates',
  EVALUATIONS: 'hr_tool_evaluations',
  DRAFTS: 'hr_tool_drafts',
};

// Valid job types - should match the JobType enum/union type
const VALID_JOB_TYPES = [
  'fresh_sales',
  'experienced_sales',
  'specialist',
  'engineer',
  'part_time_base',
  'part_time_sales',
  'finance_accounting',
  'human_resources',
  'business_development',
  'marketing'
];

// 候補者データの保存・取得
export const saveCandidates = (candidates: Candidate[]): void => {
  localStorage.setItem(STORAGE_KEYS.CANDIDATES, JSON.stringify(candidates));
};

export const getCandidates = (): Candidate[] => {
  const data = localStorage.getItem(STORAGE_KEYS.CANDIDATES);
  if (!data) return [];
  
  try {
    const candidates = JSON.parse(data);
    return candidates.map((c: any) => ({
      ...c,
      createdAt: new Date(c.createdAt),
      updatedAt: new Date(c.updatedAt),
      // Validate and fix appliedPosition
      appliedPosition: VALID_JOB_TYPES.includes(c.appliedPosition) ? c.appliedPosition : 'fresh_sales',
      // 書類のアップロード日時を変換
      documents: c.documents ? {
        ...c.documents,
        resume: c.documents.resume ? {
          ...c.documents.resume,
          uploadedAt: new Date(c.documents.resume.uploadedAt),
          extractedData: c.documents.resume.extractedData ? {
            ...c.documents.resume.extractedData,
            extractedAt: new Date(c.documents.resume.extractedData.extractedAt)
          } : undefined
        } : undefined,
        careerHistory: c.documents.careerHistory ? {
          ...c.documents.careerHistory,
          uploadedAt: new Date(c.documents.careerHistory.uploadedAt),
          extractedData: c.documents.careerHistory.extractedData ? {
            ...c.documents.careerHistory.extractedData,
            extractedAt: new Date(c.documents.careerHistory.extractedData.extractedAt)
          } : undefined
        } : undefined,
        coverLetter: c.documents.coverLetter ? {
          ...c.documents.coverLetter,
          uploadedAt: new Date(c.documents.coverLetter.uploadedAt),
          extractedData: c.documents.coverLetter.extractedData ? {
            ...c.documents.coverLetter.extractedData,
            extractedAt: new Date(c.documents.coverLetter.extractedData.extractedAt)
          } : undefined
        } : undefined,
        portfolio: c.documents.portfolio ? {
          ...c.documents.portfolio,
          uploadedAt: new Date(c.documents.portfolio.uploadedAt),
          extractedData: c.documents.portfolio.extractedData ? {
            ...c.documents.portfolio.extractedData,
            extractedAt: new Date(c.documents.portfolio.extractedData.extractedAt)
          } : undefined
        } : undefined,
        others: c.documents.others ? c.documents.others.map((doc: any) => ({
          ...doc,
          uploadedAt: new Date(doc.uploadedAt),
          extractedData: doc.extractedData ? {
            ...doc.extractedData,
            extractedAt: new Date(doc.extractedData.extractedAt)
          } : undefined
        })) : undefined
      } : undefined,
      // 面接議事録の日時を変換
      interviewMinutes: c.interviewMinutes ? c.interviewMinutes.map((m: any) => ({
        ...m,
        interviewDate: new Date(m.interviewDate),
        createdAt: new Date(m.createdAt),
        updatedAt: new Date(m.updatedAt),
        aiAnalysis: m.aiAnalysis ? {
          ...m.aiAnalysis,
          analyzedAt: new Date(m.aiAnalysis.analyzedAt)
        } : undefined
      })) : undefined,
      // SPI結果の日時を変換
      spiResults: c.spiResults ? {
        ...c.spiResults,
        testDate: new Date(c.spiResults.testDate)
      } : undefined,
      // 面接フェーズの情報を変換
      interviewPhase: c.interviewPhase || undefined
    }));
  } catch (error) {
    console.error('Failed to parse candidates:', error);
    return [];
  }
};

export const saveCandidate = (candidate: Candidate): void => {
  const candidates = getCandidates();
  const existingIndex = candidates.findIndex(c => c.id === candidate.id);
  
  if (existingIndex >= 0) {
    candidates[existingIndex] = { ...candidate, updatedAt: new Date() };
  } else {
    candidates.push(candidate);
  }
  
  saveCandidates(candidates);
};

export const deleteCandidate = (candidateId: string): void => {
  const candidates = getCandidates().filter(c => c.id !== candidateId);
  saveCandidates(candidates);
  
  // 関連する評価も削除
  const evaluations = getEvaluations().filter(e => e.candidateId !== candidateId);
  saveEvaluations(evaluations);
  
  // 関連する下書きも削除
  const drafts = getDrafts().filter(d => !d.candidateData || d.candidateData.id !== candidateId);
  saveDrafts(drafts);
};

export const getCandidateById = (candidateId: string): Candidate | null => {
  const candidates = getCandidates();
  return candidates.find(c => c.id === candidateId) || null;
};

// 評価データの保存・取得
export const saveEvaluations = (evaluations: Evaluation[]): void => {
  localStorage.setItem(STORAGE_KEYS.EVALUATIONS, JSON.stringify(evaluations));
};

export const getEvaluations = (): Evaluation[] => {
  const data = localStorage.getItem(STORAGE_KEYS.EVALUATIONS);
  if (!data) return [];
  
  try {
    const evaluations = JSON.parse(data);
    return evaluations.map((e: any) => ({
      ...e,
      evaluatedAt: new Date(e.evaluatedAt),
      hireDate: e.hireDate ? new Date(e.hireDate) : undefined,
      turnoverDate: e.turnoverDate ? new Date(e.turnoverDate) : undefined
    }));
  } catch (error) {
    console.error('Failed to parse evaluations:', error);
    return [];
  }
};

export const saveEvaluation = (evaluation: Evaluation): void => {
  const evaluations = getEvaluations();
  const existingIndex = evaluations.findIndex(e => e.candidateId === evaluation.candidateId);
  
  if (existingIndex >= 0) {
    evaluations[existingIndex] = evaluation;
  } else {
    evaluations.push(evaluation);
  }
  
  saveEvaluations(evaluations);
};

// 採用結果の更新
export const updateEvaluationOutcome = (
  candidateId: string, 
  finalDecision: 'hired' | 'rejected', 
  performanceRating?: number
): void => {
  const evaluations = getEvaluations();
  const evaluationIndex = evaluations.findIndex(e => e.candidateId === candidateId);
  
  if (evaluationIndex >= 0) {
    evaluations[evaluationIndex].finalDecision = finalDecision;
    if (performanceRating !== undefined) {
      evaluations[evaluationIndex].performanceRating = performanceRating;
    }
    
    // 採用の場合は入社日を設定
    if (finalDecision === 'hired' && !evaluations[evaluationIndex].hireDate) {
      evaluations[evaluationIndex].hireDate = new Date();
      evaluations[evaluationIndex].isActive = true;
    }
    
    saveEvaluations(evaluations);
  }
};

// 下書きデータの保存・取得
export const saveDrafts = (drafts: SavedDraft[]): void => {
  localStorage.setItem(STORAGE_KEYS.DRAFTS, JSON.stringify(drafts));
};

export const getDrafts = (): SavedDraft[] => {
  const data = localStorage.getItem(STORAGE_KEYS.DRAFTS);
  if (!data) return [];
  
  try {
    const drafts = JSON.parse(data);
    return drafts.map((d: any) => ({
      ...d,
      savedAt: new Date(d.savedAt),
    }));
  } catch (error) {
    console.error('Failed to parse drafts:', error);
    return [];
  }
};

export const saveDraft = (draft: SavedDraft): void => {
  const drafts = getDrafts();
  const existingIndex = drafts.findIndex(d => d.id === draft.id);
  
  if (existingIndex >= 0) {
    drafts[existingIndex] = { ...draft, savedAt: new Date() };
  } else {
    drafts.push(draft);
  }
  
  saveDrafts(drafts);
};

export const deleteDraft = (draftId: string): void => {
  const drafts = getDrafts().filter(d => d.id !== draftId);
  saveDrafts(drafts);
};

export const getEvaluationByCandidate = (candidateId: string): Evaluation | null => {
  const evaluations = getEvaluations();
  return evaluations.find(e => e.candidateId === candidateId) || null;
};

// サンプルデータの生成（初期データがない場合）
export const generateSampleData = (): void => {
  const candidates = getCandidates();
  const evaluations = getEvaluations();
  
  // すでにデータがある場合は生成しない
  if (candidates.length > 0 || evaluations.length > 0) {
    return;
  }
  
  // サンプル候補者データ
  const sampleCandidates: Candidate[] = [
    {
      id: '1001',
      name: '山田 太郎',
      email: 'yamada@example.com',
      phone: '090-1234-5678',
      age: 28,
      education: '東京大学 経済学部',
      major: '経済学',
      experience: '株式会社ABC（2019-2023）：法人営業として3年間勤務。新規開拓から既存顧客管理まで担当。年間売上目標120%達成。',
      selfPr: '営業経験を通じて培った交渉力と顧客理解力を活かし、御社の事業拡大に貢献したいと考えています。特に新規市場開拓に興味があり、チャレンジ精神を持って取り組む姿勢が強みです。',
      interviewNotes: '面接では落ち着いた受け答えで、質問に対して具体的な経験を交えて回答していた。',
      appliedPosition: 'experienced_sales',
      createdAt: new Date('2023-10-15'),
      updatedAt: new Date('2023-10-15')
    },
    {
      id: '1002',
      name: '佐藤 花子',
      email: 'sato@example.com',
      phone: '090-8765-4321',
      age: 22,
      education: '慶應義塾大学 商学部',
      major: 'マーケティング',
      experience: '大学時代に飲食店でのアルバイトリーダー経験あり。インターンシップでマーケティング業務を経験。',
      selfPr: '大学でマーケティングを専攻し、実際のプロジェクトでデータ分析やプロモーション企画を行いました。コミュニケーション能力と分析力を活かして貢献したいです。',
      interviewNotes: '明るく活発な印象。質問への回答は具体性に欠ける部分もあるが、学習意欲は高い。',
      appliedPosition: 'fresh_sales',
      createdAt: new Date('2023-11-05'),
      updatedAt: new Date('2023-11-05')
    },
    {
      id: '1003',
      name: '鈴木 一郎',
      email: 'suzuki@example.com',
      phone: '090-2345-6789',
      age: 35,
      education: '東京工業大学 工学部',
      major: '情報工学',
      experience: '株式会社Tech（2015-2023）：バックエンドエンジニアとして8年間勤務。大規模Webアプリケーションの設計・開発・運用を担当。チームリーダーとして5名のエンジニアをマネジメント。',
      selfPr: '技術力とマネジメント経験を活かし、御社の開発チームに貢献したいと考えています。特にパフォーマンス最適化とスケーラブルなシステム設計に強みがあります。',
      interviewNotes: '技術的な質問に対して的確に回答。コミュニケーション能力も高く、チームでの役割を理解している印象。',
      appliedPosition: 'engineer',
      createdAt: new Date('2023-09-20'),
      updatedAt: new Date('2023-09-20')
    },
    {
      id: '1004',
      name: '田中 美咲',
      email: 'tanaka@example.com',
      phone: '090-3456-7890',
      age: 26,
      education: '早稲田大学 人間科学部',
      major: '心理学',
      experience: '株式会社HR（2020-2023）：人事部で採用担当として3年間勤務。年間30名以上の採用活動を主導。社内研修プログラムの企画・運営も担当。',
      selfPr: '人事業務の経験を通じて、人材の適性を見極める目を養いました。御社の人事部門で、より戦略的な人材採用・育成に貢献したいと考えています。',
      interviewNotes: '人事としての視点が明確で、自社の課題に対する理解も深い。コミュニケーション能力が高く、チームワークを重視する姿勢が見られる。',
      appliedPosition: 'human_resources',
      createdAt: new Date('2023-10-01'),
      updatedAt: new Date('2023-10-01')
    },
    {
      id: '1005',
      name: '中村 健太',
      email: 'nakamura@example.com',
      phone: '090-4567-8901',
      age: 24,
      education: '立教大学 経営学部',
      major: '経営学',
      experience: '大学時代に学生団体の代表として50名規模の組織運営経験あり。インターンシップで営業アシスタントを経験。',
      selfPr: 'リーダーシップと行動力が強みです。目標に向かって周囲を巻き込みながら成果を出すことができます。御社の営業部門で新しい価値を創造していきたいと考えています。',
      interviewNotes: '積極性があり、質問に対して具体的なエピソードを交えて回答。チャレンジ精神が強く、成長意欲が感じられる。',
      appliedPosition: 'fresh_sales',
      createdAt: new Date('2023-11-15'),
      updatedAt: new Date('2023-11-15')
    }
  ];
  
  // サンプル評価データ
  const sampleEvaluations: Evaluation[] = [
    {
      candidateId: '1001',
      jobType: 'experienced_sales',
      scores: {
        'problem_identification': 4,
        'problem_solving': 3,
        'persistence': 4,
        'logical_thinking': 3,
        'communication': 4,
        'self_responsibility': 3,
        'extroversion': 4,
        'intellectual_curiosity': 3,
        'team_activation': 3,
        'honesty': 4,
        'work_compatibility': 4,
        'change_acceptance': 3,
        'trust_ability': 3,
        'mission_alignment': 4,
        'win_win_potential': 4
      },
      comments: {
        'problem_identification': '顧客の課題を的確に把握し、本質的な問題に焦点を当てる能力が高い。',
        'problem_solving': '解決策の提案は具体的だが、より創造的なアプローチがあるとよい。',
        'persistence': '過去の営業実績から、困難な状況でも粘り強く取り組む姿勢が見られる。',
        'communication': '明確かつ説得力のある伝達能力を持ち、顧客との信頼関係構築が得意。'
      },
      overallComment: '営業経験が豊富で、特に顧客理解と関係構築に優れています。目標達成への意欲も高く、チームへの貢献も期待できます。自社の商品・サービスへの理解を深めることで、さらなる活躍が見込めるでしょう。',
      recommendation: 'hire',
      evaluatedAt: new Date('2023-10-20'),
      isComplete: true,
      finalDecision: 'hired',
      evaluatorId: 'user1',
      evaluatorName: '評価者1',
      hireDate: new Date('2023-11-01'),
      isActive: true
    },
    {
      candidateId: '1002',
      jobType: 'fresh_sales',
      scores: {
        'problem_identification': 2,
        'problem_solving': 2,
        'persistence': 3,
        'logical_thinking': 2,
        'communication': 3,
        'self_responsibility': 2,
        'extroversion': 4,
        'intellectual_curiosity': 3,
        'team_activation': 3,
        'honesty': 3,
        'work_compatibility': 3,
        'change_acceptance': 4,
        'trust_ability': 3,
        'mission_alignment': 3,
        'win_win_potential': 2
      },
      comments: {
        'problem_identification': '基本的な問題認識はできるが、深掘りが不足している。',
        'communication': '明るく積極的なコミュニケーションができるが、論理的な説明に課題がある。',
        'extroversion': '非常に社交的で、人との関わりを楽しむ姿勢が見られる。',
        'change_acceptance': '新しい環境や変化に対して柔軟に対応できる適応力がある。'
      },
      overallComment: '明るく前向きな姿勢と社交性は評価できますが、論理的思考力と問題解決能力にはまだ成長の余地があります。研修を通じて基本的なビジネススキルを身につけることで、将来的には活躍が期待できる可能性はあります。',
      recommendation: 'consider',
      evaluatedAt: new Date('2023-11-10'),
      isComplete: true,
      finalDecision: 'rejected',
      evaluatorId: 'user2',
      evaluatorName: '評価者2'
    },
    {
      candidateId: '1003',
      jobType: 'engineer',
      scores: {
        'problem_identification': 4,
        'problem_solving': 4,
        'persistence': 3,
        'logical_thinking': 4,
        'communication': 3,
        'self_responsibility': 4,
        'intellectual_curiosity': 4,
        'team_activation': 3,
        'honesty': 4,
        'work_compatibility': 3,
        'change_acceptance': 3,
        'trust_ability': 4,
        'mission_alignment': 3,
        'win_win_potential': 4
      },
      comments: {
        'problem_identification': '技術的な問題の本質を素早く見抜く能力が高い。',
        'problem_solving': '複雑な問題に対しても体系的かつ効率的な解決策を提案できる。',
        'logical_thinking': '非常に論理的で、複雑な概念も明確に説明できる。',
        'intellectual_curiosity': '新技術への関心が高く、常に学習を続ける姿勢がある。'
      },
      overallComment: '技術力とマネジメント経験を兼ね備えた優秀な人材です。論理的思考力と問題解決能力が特に高く、チームリーダーとしての経験も豊富です。技術的な専門性だけでなく、コミュニケーション能力も高いため、チーム全体のパフォーマンス向上にも貢献できるでしょう。',
      recommendation: 'hire',
      evaluatedAt: new Date('2023-09-25'),
      isComplete: true,
      finalDecision: 'hired',
      evaluatorId: 'user1',
      evaluatorName: '評価者1',
      hireDate: new Date('2023-10-15'),
      isActive: true
    },
    {
      candidateId: '1004',
      jobType: 'human_resources',
      scores: {
        'people_management': 4,
        'communication_hr': 4,
        'analytical_thinking_hr': 3,
        'labor_law_knowledge': 3,
        'facilitation_skills': 4,
        'people_first_mindset': 4,
        'fairness_hr': 4,
        'confidentiality': 4,
        'diversity_inclusion_mindset': 3,
        'empathy_hr': 4,
        'organizational_development': 3,
        'strategic_hr_orientation': 3
      },
      comments: {
        'people_management': '人材の採用・育成に関する実務経験が豊富で、戦略的な視点を持っている。',
        'communication_hr': '明確かつ共感的なコミュニケーションができ、様々な立場の人と良好な関係を築ける。',
        'people_first_mindset': '常に従業員の成長と幸福を第一に考える姿勢が見られる。',
        'empathy_hr': '高い共感力を持ち、相手の立場に立って考えることができる。'
      },
      overallComment: '人事としての経験と専門知識を持ち、特に採用活動と人材育成に強みがあります。共感力とコミュニケーション能力が高く、組織の人材戦略を推進する役割に適しています。戦略的な視点をさらに強化することで、より高いレベルでの貢献が期待できます。',
      recommendation: 'hire',
      evaluatedAt: new Date('2023-10-05'),
      isComplete: true,
      finalDecision: 'hired',
      evaluatorId: 'user2',
      evaluatorName: '評価者2',
      hireDate: new Date('2023-11-01'),
      isActive: true
    },
    {
      candidateId: '1005',
      jobType: 'fresh_sales',
      scores: {
        'problem_identification': 3,
        'problem_solving': 3,
        'persistence': 4,
        'logical_thinking': 3,
        'communication': 4,
        'self_responsibility': 3,
        'extroversion': 4,
        'intellectual_curiosity': 3,
        'team_activation': 4,
        'honesty': 3,
        'work_compatibility': 4,
        'change_acceptance': 4,
        'trust_ability': 3,
        'mission_alignment': 3,
        'win_win_potential': 3
      },
      comments: {
        'persistence': '学生団体での活動を通じて、困難な状況でも諦めずに取り組む姿勢が見られる。',
        'communication': '明るく積極的なコミュニケーションができ、人との関係構築が得意。',
        'team_activation': 'リーダーとしてチームを活性化させた具体的な経験がある。',
        'change_acceptance': '新しい環境や変化に対して前向きに取り組む柔軟性がある。'
      },
      overallComment: '行動力とリーダーシップが強みの候補者です。学生時代の経験から、目標に向かって周囲を巻き込む力があり、営業職に必要な積極性とコミュニケーション能力を備えています。論理的思考力をさらに強化することで、より高いパフォーマンスが期待できます。',
      recommendation: 'hire',
      evaluatedAt: new Date('2023-11-20'),
      isComplete: true,
      finalDecision: 'hired',
      evaluatorId: 'user1',
      evaluatorName: '評価者1',
      hireDate: new Date('2023-12-01'),
      isActive: true
    }
  ];
  
  // データを保存
  saveCandidates(sampleCandidates);
  saveEvaluations(sampleEvaluations);
};

// アプリケーション起動時にサンプルデータを生成
generateSampleData();