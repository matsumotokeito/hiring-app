import { InterviewMinutes, InterviewAIAnalysis } from '../types';

export class InterviewMinutesProcessor {
  private apiKey: string = '';

  constructor() {
    // ChatGPT APIキーを取得
    const storedKey = localStorage.getItem('openai_api_key');
    if (storedKey) {
      this.apiKey = storedKey;
    }
  }

  public setAPIKey(apiKey: string): void {
    this.apiKey = apiKey;
    localStorage.setItem('openai_api_key', apiKey);
  }

  public hasAPIKey(): boolean {
    return !!this.apiKey && this.apiKey.trim().length > 0;
  }

  // 面接議事録を分析
  public async analyzeInterviewMinutes(minutes: InterviewMinutes): Promise<InterviewAIAnalysis> {
    if (!this.hasAPIKey()) {
      throw new Error('OpenAI APIキーが設定されていません');
    }

    try {
      const prompt = this.buildAnalysisPrompt(minutes);
      const response = await this.callChatGPT(prompt);
      const analysis = this.parseAnalysisResponse(response);
      
      return {
        ...analysis,
        analyzedAt: new Date()
      };
    } catch (error) {
      console.error('Interview minutes analysis error:', error);
      throw new Error(`面接議事録の分析に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
    }
  }

  private buildAnalysisPrompt(minutes: InterviewMinutes): string {
    return `
以下の面接議事録を分析し、候補者の評価を行ってください。

## 面接情報
- 面接フェーズ: ${this.getPhaseLabel(minutes.phase)}
- 面接日: ${minutes.interviewDate.toLocaleDateString('ja-JP')}
- 面接官: ${minutes.interviewer}
- 所要時間: ${minutes.duration}分
- 場所: ${minutes.location}

## 面接アジェンダ
${minutes.agenda}

## 質問と回答
${minutes.questions.map((q, i) => `
### 質問${i+1}: ${q.question}
**目的**: ${q.purpose}
**回答**: ${q.response}
**面接官メモ**: ${q.evaluatorNotes || 'なし'}
${q.score ? `**評価**: ${q.score}/5` : ''}
`).join('\n')}

## 面接官の観察・印象
${minutes.interviewerObservations}

## 面接官の評価
- 総合印象: ${minutes.overallImpression}
- 評価: ${minutes.rating}/5
- 推奨: ${this.getRecommendationLabel(minutes.recommendation)}

## 分析要求
以下の形式でJSONレスポンスを返してください：

{
  "overallAssessment": "候補者の総合評価（300文字以内）",
  "strengthsIdentified": ["特定された強み1", "強み2", "強み3"],
  "concernsIdentified": ["特定された懸念点1", "懸念点2"],
  "skillsAssessment": {
    "communication": 1-5の数値,
    "technicalSkills": 1-5の数値,
    "problemSolving": 1-5の数値,
    "culturalFit": 1-5の数値,
    "motivation": 1-5の数値
  },
  "recommendedQuestions": ["次回面接での推奨質問1", "推奨質問2", "推奨質問3"],
  "redFlags": ["注意すべき点1", "注意すべき点2"],
  "positiveSignals": ["ポジティブなシグナル1", "ポジティブなシグナル2"],
  "confidenceLevel": 0-1の数値（分析の信頼度）
}

## 分析観点
1. 回答内容の一貫性と具体性
2. 非言語的コミュニケーションと態度
3. 技術的・専門的スキルの実証
4. 文化適合性と価値観の一致
5. モチベーションと長期的コミットメント
6. 問題解決能力と思考プロセス
7. 学習意欲と成長マインドセット

必ずJSON形式のみで回答し、他の文章は含めないでください。
`;
  }

  private getPhaseLabel(phase: string): string {
    switch (phase) {
      case 'casual': return 'カジュアル面談';
      case 'first': return '1次面接';
      case 'second': return '2次面接';
      case 'final': return '最終面接';
      default: return phase;
    }
  }

  private getRecommendationLabel(recommendation: string): string {
    switch (recommendation) {
      case 'strong_hire': return '積極採用';
      case 'hire': return '採用';
      case 'consider': return '検討';
      case 'no_hire': return '不採用';
      default: return recommendation;
    }
  }

  private async callChatGPT(prompt: string): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: 'あなたは経験豊富な人事採用コンサルタントです。面接議事録を分析し、候補者の評価を行ってください。必ずJSON形式で回答してください。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || 'Unknown error';
      throw new Error(`ChatGPT API エラー: ${response.status} - ${errorMessage}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  private parseAnalysisResponse(response: string): InterviewAIAnalysis {
    try {
      // JSONの抽出
      const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || response.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : response;
      
      const parsed = JSON.parse(jsonString);
      
      return {
        overallAssessment: parsed.overallAssessment || '',
        strengthsIdentified: Array.isArray(parsed.strengthsIdentified) ? parsed.strengthsIdentified : [],
        concernsIdentified: Array.isArray(parsed.concernsIdentified) ? parsed.concernsIdentified : [],
        skillsAssessment: {
          communication: this.normalizeScore(parsed.skillsAssessment?.communication),
          technicalSkills: this.normalizeScore(parsed.skillsAssessment?.technicalSkills),
          problemSolving: this.normalizeScore(parsed.skillsAssessment?.problemSolving),
          culturalFit: this.normalizeScore(parsed.skillsAssessment?.culturalFit),
          motivation: this.normalizeScore(parsed.skillsAssessment?.motivation)
        },
        recommendedQuestions: Array.isArray(parsed.recommendedQuestions) ? parsed.recommendedQuestions : [],
        redFlags: Array.isArray(parsed.redFlags) ? parsed.redFlags : [],
        positiveSignals: Array.isArray(parsed.positiveSignals) ? parsed.positiveSignals : [],
        confidenceLevel: Math.max(0, Math.min(1, parsed.confidenceLevel || 0.5)),
        analyzedAt: new Date()
      };
    } catch (error) {
      console.error('Failed to parse analysis response:', error);
      throw new Error('分析結果の解析に失敗しました');
    }
  }

  private normalizeScore(score: any): number {
    if (typeof score !== 'number' || isNaN(score)) {
      return 3; // デフォルト値
    }
    return Math.max(1, Math.min(5, Math.round(score)));
  }
}