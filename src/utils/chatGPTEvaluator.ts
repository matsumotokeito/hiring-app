import { Candidate, Evaluation, JobType, AIPrediction, SPIResults } from '../types';
import { getJobTypeConfigSync } from '../config/jobTypes';
import { getJobPostingByJobType } from './jobPostingStorage';
import { getCompanyInfo } from './companyInfoStorage';

interface ChatGPTResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

interface ChatGPTAnalysis {
  recommendedScore: number;
  confidence: number;
  reasoning: string;
  strengths: string[];
  riskFactors: string[];
  recommendations: string[];
}

interface CriteriaMatchingAnalysis {
  criterionId: string;
  criterionName: string;
  matchingScore: number;
  confidence: number;
  reasoning: string;
  evidences: string[];
  concerns: string[];
  recommendations: string[];
}

interface ComprehensiveMatchingAnalysis {
  overallMatchingScore: number;
  overallConfidence: number;
  overallReasoning: string;
  criteriaAnalysis: CriteriaMatchingAnalysis[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  riskFactors: string[];
}

interface InterviewQuestion {
  question: string;
  purpose: string;
  targetCriteria: string[];
  expectedInsights: string[];
}

export class ChatGPTEvaluator {
  private apiKey: string;
  private baseURL = 'https://api.openai.com/v1/chat/completions';


    constructor() {
    // 環境変数からAPIキーを読み込む
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    // localStorage のフォールバック
    if (!this.apiKey) {
      const storedKey = localStorage.getItem('openai_api_key');
      if (storedKey) {
        this.apiKey = storedKey;
      }
    }
  }

  public setAPIKey(apiKey: string): void {
    this.apiKey = apiKey;
    localStorage.setItem('openai_api_key', apiKey);
  }

  public hasAPIKey(): boolean {
    return !!this.apiKey && this.apiKey.trim().length > 0;
  }

  private handleAPIError(error: any, operation: string): Error {
    if (error.message?.includes('429')) {
      return new Error(`API使用量の上限に達しました。OpenAIアカウントの使用状況と請求詳細をご確認ください。詳細: https://platform.openai.com/account/usage`);
    } else if (error.message?.includes('401')) {
      return new Error('APIキーが無効です。正しいOpenAI APIキーを設定してください。');
    } else if (error.message?.includes('403')) {
      return new Error('APIアクセスが拒否されました。アカウントの権限をご確認ください。');
    } else if (error.message?.includes('500') || error.message?.includes('502') || error.message?.includes('503')) {
      return new Error('OpenAIサーバーに一時的な問題が発生しています。しばらく時間をおいて再試行してください。');
    } else {
      return new Error(`${operation}中にエラーが発生しました: ${error.message || '不明なエラー'}`);
    }
  }

  public async evaluateCandidate(
    candidate: Candidate,
    currentEvaluation?: Partial<Evaluation>
  ): Promise<AIPrediction> {
    if (!this.hasAPIKey()) {
      throw new Error('OpenAI APIキーが設定されていません。設定画面からAPIキーを入力してください。');
    }

    try {
      const prompt = this.buildEvaluationPrompt(candidate, currentEvaluation);
      const response = await this.callChatGPT(prompt);
      const analysis = this.parseResponse(response);
      
      return {
        recommendedScore: analysis.recommendedScore,
        confidence: analysis.confidence,
        reasoning: analysis.reasoning,
        similarCandidates: [], // ChatGPTでは類似候補者は提供しない
        riskFactors: analysis.riskFactors,
        strengths: analysis.strengths
      };
    } catch (error) {
      console.error('ChatGPT評価エラー:', error);
      throw this.handleAPIError(error, 'AI評価');
    }
  }

  public async analyzeMatchingToCriteria(
    candidate: Candidate,
    currentEvaluation?: Partial<Evaluation>
  ): Promise<ComprehensiveMatchingAnalysis> {
    if (!this.hasAPIKey()) {
      throw new Error('OpenAI APIキーが設定されていません。設定画面からAPIキーを入力してください。');
    }

    try {
      const prompt = this.buildMatchingAnalysisPrompt(candidate, currentEvaluation);
      const response = await this.callChatGPT(prompt);
      const analysis = this.parseMatchingResponse(response);
      
      return analysis;
    } catch (error) {
      console.error('ChatGPT マッチング分析エラー:', error);
      throw this.handleAPIError(error, 'マッチング分析');
    }
  }

  private buildMatchingAnalysisPrompt(
    candidate: Candidate,
    currentEvaluation?: Partial<Evaluation>
  ): string {
    const jobConfig = getJobTypeConfigSync(candidate.appliedPosition);
    const jobPosting = getJobPostingByJobType(candidate.appliedPosition);
    const companyInfo = getCompanyInfo();
    
    let prompt = `
あなたは経験豊富な人事採用コンサルタントです。以下の候補者情報を詳細に分析し、各評価基準に対するマッチング度を判定してください。

## 応募職種
${jobConfig.name}: ${jobConfig.description}
`;

    // 会社情報を追加
    if (companyInfo) {
      prompt += `
## 会社情報・評価基準
### 企業概要
- 会社名: ${companyInfo.companyName}
- ミッション: ${companyInfo.mission}
- ビジョン: ${companyInfo.vision}
- 企業文化: ${companyInfo.culture}

### 企業価値観
${companyInfo.values.map(v => `- ${v}`).join('\n')}

### 行動指針
${companyInfo.behavioralGuidelines.map(g => `- ${g}`).join('\n')}

### 採用基準
${companyInfo.hiringCriteria.map(c => `- ${c}`).join('\n')}

### 評価哲学
${companyInfo.evaluationPhilosophy}

### 労働環境・組織文化
- 労働環境: ${companyInfo.workEnvironment}
- リーダーシップスタイル: ${companyInfo.leadershipStyle}
- チームダイナミクス: ${companyInfo.teamDynamics}
- パフォーマンス期待値: ${companyInfo.performanceExpectations}
- キャリア開発: ${companyInfo.careerDevelopment}
- ダイバーシティ＆インクルージョン: ${companyInfo.diversityInclusion}

### 追加コンテキスト
${companyInfo.additionalContext}
`;
    }

    // 求人票情報を追加
    if (jobPosting) {
      prompt += `
## 求人票情報
### 職種詳細
- 職種名: ${jobPosting.title}
- 部署: ${jobPosting.department}
- 勤務地: ${jobPosting.location}
- 雇用形態: ${jobPosting.employmentType === 'full-time' ? '正社員' : 
                jobPosting.employmentType === 'part-time' ? 'パート' :
                jobPosting.employmentType === 'contract' ? '契約社員' : 'インターン'}
- 給与範囲: ${jobPosting.salaryRange.min.toLocaleString()}〜${jobPosting.salaryRange.max.toLocaleString()} ${jobPosting.salaryRange.currency}

### 応募要件
**学歴要件**: ${jobPosting.requirements.education.join(', ')}
**経験要件**: ${jobPosting.requirements.experience.join(', ')}
**スキル要件**: ${jobPosting.requirements.skills.join(', ')}
**資格要件**: ${jobPosting.requirements.qualifications.join(', ')}
**語学要件**: ${jobPosting.requirements.languages.join(', ')}

### 主な業務内容
${jobPosting.responsibilities.map(r => `- ${r}`).join('\n')}

### 福利厚生
${jobPosting.benefits.map(b => `- ${b}`).join('\n')}

### 労働条件
- 勤務時間: ${jobPosting.workingConditions.workingHours}
- 休日: ${jobPosting.workingConditions.holidays}
- 残業: ${jobPosting.workingConditions.overtime}
- リモートワーク: ${jobPosting.workingConditions.remoteWork ? '可能' : '不可'}
- 出張: ${jobPosting.workingConditions.travelRequired ? 'あり' : 'なし'}

### キャリアパス
**初期役職**: ${jobPosting.careerPath.initialRole}
**成長機会**: ${jobPosting.careerPath.growthOpportunities.join(', ')}
**研修制度**: ${jobPosting.careerPath.trainingPrograms.join(', ')}
`;
    }

    prompt += `
## 候補者情報
### 基本情報
- 氏名: ${candidate.name}
- 年齢: ${candidate.age}歳
- 学歴: ${candidate.education}
${candidate.major ? `- 専攻: ${candidate.major}` : ''}
- メール: ${candidate.email}
${candidate.phone ? `- 電話: ${candidate.phone}` : ''}

### 職歴・経験
${candidate.experience}

### 自己PR
${candidate.selfPr}

${candidate.interviewNotes ? `### 面接メモ・追加情報\n${candidate.interviewNotes}` : ''}
`;

    // 書類情報がある場合は追加
    if (candidate.documents) {
      if (candidate.documents.resume) {
        prompt += `\n### 履歴書\n${candidate.documents.resume.content.substring(0, 1000)}${candidate.documents.resume.content.length > 1000 ? '...(省略)' : ''}\n`;
      }
      
      if (candidate.documents.careerHistory) {
        prompt += `\n### 職務経歴書\n${candidate.documents.careerHistory.content.substring(0, 1000)}${candidate.documents.careerHistory.content.length > 1000 ? '...(省略)' : ''}\n`;
      }
    }

    // 面接議事録がある場合は追加
    if (candidate.interviewMinutes && candidate.interviewMinutes.length > 0) {
      prompt += `\n### 面接議事録\n`;
      candidate.interviewMinutes.forEach((minutes, index) => {
        prompt += `#### ${this.getInterviewPhaseLabel(minutes.phase)} (${minutes.interviewDate.toLocaleDateString('ja-JP')})\n`;
        prompt += `面接官: ${minutes.interviewer}\n`;
        prompt += `総合印象: ${minutes.overallImpression}\n`;
        prompt += `評価: ${minutes.rating}/5\n`;
        
        if (minutes.questions && minutes.questions.length > 0) {
          prompt += `\n主な質問と回答:\n`;
          minutes.questions.slice(0, 3).forEach((q, i) => {
            prompt += `Q${i+1}: ${q.question}\nA: ${q.response}\n`;
          });
        }
        
        if (minutes.keyInsights && minutes.keyInsights.length > 0) {
          prompt += `\n主な洞察: ${minutes.keyInsights.join(', ')}\n`;
        }
      });
    }

    // SPI結果がある場合は追加
    if (candidate.spiResults) {
      prompt += this.buildSPISection(candidate.spiResults);
    }

    // 現在の評価とコメントがある場合は追加
    if (currentEvaluation?.scores || currentEvaluation?.comments) {
      prompt += this.buildCurrentEvaluationSection(currentEvaluation, jobConfig);
    }

    prompt += `

## 評価基準詳細
以下の各基準について、候補者がどの程度マッチしているかを分析してください：

${jobConfig.evaluationCriteria.map((criterion, index) => 
  `### ${index + 1}. ${criterion.name} (重み: ${criterion.weight}%, カテゴリ: ${criterion.category})
**説明**: ${criterion.description}
**求められる要素**: この基準で高評価を得るために必要な具体的な要素や経験を考慮してください。`
).join('\n\n')}

## 分析要求
以下の形式でJSONレスポンスを返してください：

{
  "overallMatchingScore": 1-5の数値（小数点1桁まで）,
  "overallConfidence": 0-1の数値（小数点2桁まで）,
  "overallReasoning": "総合的なマッチング判定の理由（300文字以内）",
  "criteriaAnalysis": [
    {
      "criterionId": "評価基準のID",
      "criterionName": "評価基準名",
      "matchingScore": 1-5の数値（小数点1桁まで）,
      "confidence": 0-1の数値（小数点2桁まで）,
      "reasoning": "この基準に対するマッチング理由（200文字以内）",
      "evidences": ["根拠となる具体的な情報1", "根拠となる具体的な情報2"],
      "concerns": ["懸念点や不足している要素1", "懸念点や不足している要素2"],
      "recommendations": ["この基準を満たすための推奨事項1", "推奨事項2"]
    }
  ],
  "strengths": ["候補者の全体的な強み1", "強み2", "強み3"],
  "weaknesses": ["改善が必要な領域1", "領域2"],
  "recommendations": ["採用判定に関する推奨事項1", "推奨事項2", "推奨事項3"],
  "riskFactors": ["採用リスク要因1", "リスク要因2"]
}

## 分析観点
1. **企業価値観との適合性**: 会社の価値観・行動指針と候補者の価値観の整合性
2. **求人票との整合性**: 求人票の要件・業務内容・企業文化と候補者の適合度
3. **具体的な根拠**: 候補者の経験、発言、行動から具体的な根拠を抽出
4. **基準との整合性**: 各評価基準の要求事項と候補者の特性の整合性
5. **成長ポテンシャル**: 現在のレベルだけでなく、将来的な成長可能性
6. **文化適合性**: 組織文化や職種特性との適合度
7. **リスク評価**: 採用後のパフォーマンスや定着に関するリスク
${candidate.spiResults ? '8. **SPI整合性**: 適性検査結果と実際の経験・発言の整合性' : ''}
${jobPosting ? '9. **労働条件適合性**: 勤務条件・キャリアパスへの適応可能性' : ''}
${companyInfo ? '10. **企業文化適合性**: 企業文化・価値観・行動指針との適合度' : ''}
${candidate.documents ? '11. **書類整合性**: 履歴書・職務経歴書の内容と面接での発言の整合性' : ''}
${candidate.interviewMinutes ? '12. **面接パフォーマンス**: 面接での受け答えや態度の評価' : ''}

**重要**: 必ずJSON形式のみで回答し、他の文章は含めないでください。各評価基準について具体的な根拠と懸念点を明確に示してください。会社情報と求人票の情報を十分に活用して、実際の職務要件と企業文化との適合度を詳細に分析してください。`;

    return prompt;
  }

  private getInterviewPhaseLabel(phase: string): string {
    switch (phase) {
      case 'casual': return 'カジュアル面談';
      case 'first': return '1次面接';
      case 'second': return '2次面接';
      case 'final': return '最終面接';
      default: return phase;
    }
  }

  private buildEvaluationPrompt(
    candidate: Candidate,
    currentEvaluation?: Partial<Evaluation>
  ): string {
    const jobConfig = getJobTypeConfigSync(candidate.appliedPosition);
    const jobPosting = getJobPostingByJobType(candidate.appliedPosition);
    const companyInfo = getCompanyInfo();
    
    let prompt = `
あなたは経験豊富な人事採用コンサルタントです。以下の候補者情報を分析し、採用判定を行ってください。

## 応募職種
${jobConfig.name}: ${jobConfig.description}
`;

    // 会社情報を追加
    if (companyInfo) {
      prompt += `
## 会社情報・評価基準
### 企業概要
- 会社名: ${companyInfo.companyName}
- ミッション: ${companyInfo.mission}
- ビジョン: ${companyInfo.vision}
- 企業文化: ${companyInfo.culture}

### 企業価値観
${companyInfo.values.map(v => `- ${v}`).join('\n')}

### 行動指針
${companyInfo.behavioralGuidelines.map(g => `- ${g}`).join('\n')}

### 採用基準
${companyInfo.hiringCriteria.map(c => `- ${c}`).join('\n')}

### 評価哲学
${companyInfo.evaluationPhilosophy}

### 追加コンテキスト
${companyInfo.additionalContext}
`;
    }

    // 求人票情報を追加
    if (jobPosting) {
      prompt += `
## 求人票詳細
- 職種名: ${jobPosting.title}
- 部署: ${jobPosting.department}
- 主な業務: ${jobPosting.responsibilities.slice(0, 3).join(', ')}
- 必要スキル: ${jobPosting.requirements.skills.join(', ')}
- 必要経験: ${jobPosting.requirements.experience.join(', ')}
- 企業文化: ${jobPosting.companyInfo.culture}
- キャリアパス: ${jobPosting.careerPath.growthOpportunities.slice(0, 3).join(', ')}
`;
    }

    prompt += `
## 評価基準
${jobConfig.evaluationCriteria.map(criterion => 
  `- ${criterion.name} (重み: ${criterion.weight}%): ${criterion.description}`
).join('\n')}

## 候補者情報
- 氏名: ${candidate.name}
- 年齢: ${candidate.age}歳
- 学歴: ${candidate.education}
${candidate.major ? `- 専攻: ${candidate.major}` : ''}

### 職歴・経験
${candidate.experience}

### 自己PR
${candidate.selfPr}

${candidate.interviewNotes ? `### 面接メモ\n${candidate.interviewNotes}` : ''}
`;

    // 書類情報がある場合は追加
    if (candidate.documents) {
      if (candidate.documents.resume) {
        prompt += `\n### 履歴書\n${candidate.documents.resume.content.substring(0, 1000)}${candidate.documents.resume.content.length > 1000 ? '...(省略)' : ''}\n`;
      }
      
      if (candidate.documents.careerHistory) {
        prompt += `\n### 職務経歴書\n${candidate.documents.careerHistory.content.substring(0, 1000)}${candidate.documents.careerHistory.content.length > 1000 ? '...(省略)' : ''}\n`;
      }
    }

    // 面接議事録がある場合は追加
    if (candidate.interviewMinutes && candidate.interviewMinutes.length > 0) {
      prompt += `\n### 面接議事録\n`;
      candidate.interviewMinutes.forEach((minutes, index) => {
        prompt += `#### ${this.getInterviewPhaseLabel(minutes.phase)} (${minutes.interviewDate.toLocaleDateString('ja-JP')})\n`;
        prompt += `面接官: ${minutes.interviewer}\n`;
        prompt += `総合印象: ${minutes.overallImpression}\n`;
        prompt += `評価: ${minutes.rating}/5\n`;
        
        if (minutes.questions && minutes.questions.length > 0) {
          prompt += `\n主な質問と回答:\n`;
          minutes.questions.slice(0, 3).forEach((q, i) => {
            prompt += `Q${i+1}: ${q.question}\nA: ${q.response}\n`;
          });
        }
        
        if (minutes.keyInsights && minutes.keyInsights.length > 0) {
          prompt += `\n主な洞察: ${minutes.keyInsights.join(', ')}\n`;
        }
      });
    }

    // SPI結果がある場合は追加
    if (candidate.spiResults) {
      prompt += this.buildSPISection(candidate.spiResults);
    }

    // 現在の評価がある場合は追加
    if (currentEvaluation?.scores) {
      prompt += this.buildCurrentEvaluationSection(currentEvaluation, jobConfig);
    }

    prompt += `

## 分析要求
以下の形式でJSONレスポンスを返してください：

{
  "recommendedScore": 1-5の数値（小数点1桁まで）,
  "confidence": 0-1の数値（小数点2桁まで）,
  "reasoning": "判定理由の詳細説明（200文字以内）",
  "strengths": ["強み1", "強み2", "強み3"],
  "riskFactors": ["リスク要因1", "リスク要因2"],
  "recommendations": ["推奨事項1", "推奨事項2", "推奨事項3"]
}

## 評価観点
1. 職種適性と経験の一致度
2. 成長ポテンシャルと学習意欲
3. 組織文化への適合性
4. コミュニケーション能力
5. 長期的な活躍可能性
${candidate.spiResults ? '6. SPI適性検査結果との整合性' : ''}
${jobPosting ? '7. 求人票要件との適合度' : ''}
${companyInfo ? '8. 企業価値観・文化との適合性' : ''}
${candidate.documents ? '9. 書類内容の一貫性と具体性' : ''}
${candidate.interviewMinutes ? '10. 面接でのパフォーマンスと回答内容' : ''}

必ずJSON形式のみで回答し、他の文章は含めないでください。`;

    return prompt;
  }

  private buildSPISection(spiResults: SPIResults): string {
    return `
### SPI適性検査結果
- 受検日: ${spiResults.testDate.toLocaleDateString('ja-JP')}
- 総合スコア: ${spiResults.totalScore} (パーセンタイル: ${spiResults.percentile}%)
- 言語能力: ${spiResults.language.totalScore} (語彙: ${spiResults.language.vocabulary}, 読解: ${spiResults.language.reading})
- 非言語能力: ${spiResults.nonVerbal.totalScore} (計算: ${spiResults.nonVerbal.calculation}, 論理: ${spiResults.nonVerbal.logic})

#### 性格特性
- リーダーシップ: ${spiResults.personality.behavioral.leadership}
- チームワーク: ${spiResults.personality.behavioral.teamwork}
- 積極性: ${spiResults.personality.behavioral.initiative}
- コミュニケーション: ${spiResults.personality.behavioral.communication}
- 分析的思考: ${spiResults.personality.cognitive.analytical}
- 創造的思考: ${spiResults.personality.cognitive.creative}
- 情緒安定性: ${spiResults.personality.emotional.stability}
- ストレス耐性: ${spiResults.personality.emotional.stress}

#### 職務適性
- 営業適性: ${spiResults.personality.jobFit.sales}
- 管理適性: ${spiResults.personality.jobFit.management}
- 技術適性: ${spiResults.personality.jobFit.technical}
`;
  }

  private buildCurrentEvaluationSection(
    evaluation: Partial<Evaluation>,
    jobConfig: any
  ): string {
    let section = '\n### 現在の評価状況\n';
    
    if (evaluation.scores) {
      section += '#### 評価スコア\n';
      Object.entries(evaluation.scores).forEach(([criterionId, score]) => {
        const criterion = jobConfig.evaluationCriteria.find((c: any) => c.id === criterionId);
        if (criterion) {
          section += `- ${criterion.name}: ${score}/5\n`;
        }
      });
    }

    if (evaluation.comments) {
      section += '\n#### 評価コメント\n';
      Object.entries(evaluation.comments).forEach(([criterionId, comment]) => {
        const criterion = jobConfig.evaluationCriteria.find((c: any) => c.id === criterionId);
        if (criterion && comment) {
          section += `- ${criterion.name}: ${comment}\n`;
        }
      });
    }

    if (evaluation.overallComment) {
      section += `\n#### 総合コメント\n${evaluation.overallComment}\n`;
    }

    return section;
  }

  private async callChatGPT(prompt: string): Promise<string> {
    const response = await fetch(this.baseURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'あなたは経験豊富な人事採用コンサルタントです。客観的で建設的な評価を行い、必ずJSON形式で回答してください。具体的な根拠に基づいて分析し、実用的な推奨事項を提供してください。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 3000
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || 'Unknown error';
      throw new Error(`ChatGPT API エラー: ${response.status} - ${errorMessage}`);
    }

    const data: ChatGPTResponse = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  private parseResponse(response: string): ChatGPTAnalysis {
    try {
      // JSONの抽出（```json ブロックがある場合に対応）
      const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || response.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : response;
      
      const parsed = JSON.parse(jsonString);
      
      return {
        recommendedScore: Math.max(1, Math.min(5, parsed.recommendedScore || 3)),
        confidence: Math.max(0, Math.min(1, parsed.confidence || 0.5)),
        reasoning: parsed.reasoning || 'AI分析結果',
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 5) : [],
        riskFactors: Array.isArray(parsed.riskFactors) ? parsed.riskFactors.slice(0, 5) : [],
        recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations.slice(0, 5) : []
      };
    } catch (error) {
      console.error('ChatGPT レスポンス解析エラー:', error);
      console.log('Raw response:', response);
      
      // フォールバック: 基本的な分析を返す
      return {
        recommendedScore: 3.0,
        confidence: 0.3,
        reasoning: 'AI分析の解析中にエラーが発生しました。手動での評価をお勧めします。',
        strengths: [],
        riskFactors: ['AI分析エラー'],
        recommendations: ['手動評価の実施を推奨']
      };
    }
  }

  private parseMatchingResponse(response: string): ComprehensiveMatchingAnalysis {
    try {
      // JSONの抽出（```json ブロックがある場合に対応）
      const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || response.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : response;
      
      const parsed = JSON.parse(jsonString);
      
      return {
        overallMatchingScore: Math.max(1, Math.min(5, parsed.overallMatchingScore || 3)),
        overallConfidence: Math.max(0, Math.min(1, parsed.overallConfidence || 0.5)),
        overallReasoning: parsed.overallReasoning || 'マッチング分析結果',
        criteriaAnalysis: Array.isArray(parsed.criteriaAnalysis) ? parsed.criteriaAnalysis.map((criteria: any) => ({
          criterionId: criteria.criterionId || '',
          criterionName: criteria.criterionName || '',
          matchingScore: Math.max(1, Math.min(5, criteria.matchingScore || 3)),
          confidence: Math.max(0, Math.min(1, criteria.confidence || 0.5)),
          reasoning: criteria.reasoning || '',
          evidences: Array.isArray(criteria.evidences) ? criteria.evidences.slice(0, 3) : [],
          concerns: Array.isArray(criteria.concerns) ? criteria.concerns.slice(0, 3) : [],
          recommendations: Array.isArray(criteria.recommendations) ? criteria.recommendations.slice(0, 3) : []
        })) : [],
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 5) : [],
        weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses.slice(0, 5) : [],
        recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations.slice(0, 5) : [],
        riskFactors: Array.isArray(parsed.riskFactors) ? parsed.riskFactors.slice(0, 5) : []
      };
    } catch (error) {
      console.error('ChatGPT マッチング分析レスポンス解析エラー:', error);
      console.log('Raw response:', response);
      
      // フォールバック: 基本的な分析を返す
      return {
        overallMatchingScore: 3.0,
        overallConfidence: 0.3,
        overallReasoning: 'マッチング分析の解析中にエラーが発生しました。手動での評価をお勧めします。',
        criteriaAnalysis: [],
        strengths: [],
        weaknesses: ['AI分析エラー'],
        recommendations: ['手動評価の実施を推奨'],
        riskFactors: ['AI分析エラー']
      };
    }
  }

  public async generateInterviewQuestions(candidate: Candidate): Promise<InterviewQuestion[]> {
    if (!this.hasAPIKey()) {
      throw new Error('OpenAI APIキーが設定されていません。設定画面からAPIキーを入力してください。');
    }

    const jobConfig = getJobTypeConfigSync(candidate.appliedPosition);
    const jobPosting = getJobPostingByJobType(candidate.appliedPosition);
    const companyInfo = getCompanyInfo();
    
    let prompt = `
候補者の情報に基づいて効果的な面接質問を生成してください。各質問には、その質問をする目的や、どのような素養や能力を評価するためのものかを明記してください。

## 応募職種
${jobConfig.name}: ${jobConfig.description}
`;

    if (companyInfo) {
      prompt += `
## 会社情報
- 企業価値観: ${companyInfo.values.join(', ')}
- 行動指針: ${companyInfo.behavioralGuidelines.slice(0, 3).join(', ')}
- 企業文化: ${companyInfo.culture}
`;
    }

    if (jobPosting) {
      prompt += `
## 求人票情報
- 主な業務: ${jobPosting.responsibilities.slice(0, 3).join(', ')}
- 必要スキル: ${jobPosting.requirements.skills.join(', ')}
- 企業文化: ${jobPosting.companyInfo.culture}
`;
    }

    prompt += `
## 候補者情報
- 年齢: ${candidate.age}歳
- 学歴: ${candidate.education}
- 経験: ${candidate.experience}
- 自己PR: ${candidate.selfPr}
`;

    // 書類情報がある場合は追加
    if (candidate.documents) {
      if (candidate.documents.resume) {
        prompt += `\n### 履歴書抜粋\n${candidate.documents.resume.content.substring(0, 500)}...\n`;
      }
      
      if (candidate.documents.careerHistory) {
        prompt += `\n### 職務経歴書抜粋\n${candidate.documents.careerHistory.content.substring(0, 500)}...\n`;
      }
    }

    // 面接議事録がある場合は追加
    if (candidate.interviewMinutes && candidate.interviewMinutes.length > 0) {
      prompt += `\n### 過去の面接情報\n`;
      candidate.interviewMinutes.forEach((minutes, index) => {
        prompt += `${this.getInterviewPhaseLabel(minutes.phase)}での主な洞察: ${minutes.keyInsights.join(', ')}\n`;
        prompt += `懸念点: ${minutes.concerns.join(', ')}\n`;
        prompt += `強み: ${minutes.strengths.join(', ')}\n`;
      });
    }

    prompt += `
## 評価基準
${jobConfig.evaluationCriteria.map(criterion => 
  `- ${criterion.name} (${criterion.category}): ${criterion.description}`
).join('\n')}

以下の形式でJSONレスポンスを返してください：
{
  "questions": [
    {
      "question": "質問文",
      "purpose": "この質問をする目的・理由（どのような素養や能力を評価するためか）",
      "targetCriteria": ["評価対象となる基準1", "評価対象となる基準2"],
      "expectedInsights": ["この質問から得られる洞察1", "洞察2"]
    }
  ]
}

候補者の背景と職種要件、企業文化を踏まえた、具体的で深掘りできる質問を5つ生成してください。
各質問は、特定の評価基準や素養を評価するために設計し、その目的を明確に説明してください。
`;

    try {
      const response = await this.callChatGPT(prompt);
      const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || response.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : response;
      const parsed = JSON.parse(jsonString);
      return Array.isArray(parsed.questions) ? parsed.questions : [];
    } catch (error) {
      console.error('面接質問生成エラー:', error);
      throw this.handleAPIError(error, '面接質問生成');
    }
  }

  public async analyzeTurnoverRisk(candidate: Candidate, evaluation?: Partial<Evaluation>): Promise<{
    riskLevel: 'low' | 'medium' | 'high';
    riskScore: number;
    factors: string[];
    recommendations: string[];
  }> {
    if (!this.hasAPIKey()) {
      throw new Error('OpenAI APIキーが設定されていません。設定画面からAPIキーを入力してください。');
    }

    const jobPosting = getJobPostingByJobType(candidate.appliedPosition);
    const companyInfo = getCompanyInfo();

    let prompt = `
以下の候補者情報を分析し、入社後1年以内の離職リスクを評価してください。

## 候補者情報
- 年齢: ${candidate.age}歳
- 学歴: ${candidate.education}
- 職歴・経験: ${candidate.experience}
- 自己PR: ${candidate.selfPr}
${candidate.interviewNotes ? `- 面接メモ: ${candidate.interviewNotes}` : ''}
`;

    // 書類情報がある場合は追加
    if (candidate.documents) {
      if (candidate.documents.resume) {
        prompt += `\n### 履歴書抜粋\n${candidate.documents.resume.content.substring(0, 500)}...\n`;
      }
      
      if (candidate.documents.careerHistory) {
        prompt += `\n### 職務経歴書抜粋\n${candidate.documents.careerHistory.content.substring(0, 500)}...\n`;
      }
    }

    // 面接議事録がある場合は追加
    if (candidate.interviewMinutes && candidate.interviewMinutes.length > 0) {
      prompt += `\n### 面接情報\n`;
      candidate.interviewMinutes.forEach((minutes, index) => {
        prompt += `${this.getInterviewPhaseLabel(minutes.phase)}での主な洞察: ${minutes.keyInsights.join(', ')}\n`;
        prompt += `懸念点: ${minutes.concerns.join(', ')}\n`;
      });
    }

    if (companyInfo) {
      prompt += `
## 会社情報
- 企業文化: ${companyInfo.culture}
- 労働環境: ${companyInfo.workEnvironment}
- キャリア開発: ${companyInfo.careerDevelopment}
`;
    }

    if (jobPosting) {
      prompt += `
## 求人票情報
- 勤務時間: ${jobPosting.workingConditions.workingHours}
- 残業: ${jobPosting.workingConditions.overtime}
- リモートワーク: ${jobPosting.workingConditions.remoteWork ? '可能' : '不可'}
- 出張: ${jobPosting.workingConditions.travelRequired ? 'あり' : 'なし'}
- 企業文化: ${jobPosting.companyInfo.culture}
`;
    }

    if (candidate.spiResults) {
      prompt += `
## SPI適性検査結果
- 情緒安定性: ${candidate.spiResults.personality.emotional.stability}
- ストレス耐性: ${candidate.spiResults.personality.emotional.stress}
- 適応性: ${candidate.spiResults.personality.behavioral.adaptability}
- チームワーク: ${candidate.spiResults.personality.behavioral.teamwork}
`;
    }

    prompt += `
以下の形式でJSONレスポンスを返してください：
{
  "riskLevel": "low/medium/high",
  "riskScore": 0-1の数値,
  "factors": ["リスク要因1", "リスク要因2"],
  "recommendations": ["対策1", "対策2", "対策3"]
}
`;

    try {
      const response = await this.callChatGPT(prompt);
      const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || response.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : response;
      const parsed = JSON.parse(jsonString);
      
      return {
        riskLevel: ['low', 'medium', 'high'].includes(parsed.riskLevel) ? parsed.riskLevel : 'medium',
        riskScore: Math.max(0, Math.min(1, parsed.riskScore || 0.5)),
        factors: Array.isArray(parsed.factors) ? parsed.factors : [],
        recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : []
      };
    } catch (error) {
      console.error('離職リスク分析エラー:', error);
      throw this.handleAPIError(error, '離職リスク分析');
    }
  }

  public updateTrainingData(candidateId: string, finalDecision: 'hired' | 'rejected', performanceRating?: number): void {
    // ChatGPTでは学習データの更新は行わない
    console.log('ChatGPT evaluator does not support training data updates');
  }
}