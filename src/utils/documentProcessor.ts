import { DocumentFile, ExtractedDocumentData, CandidateDocuments } from '../types';

export class DocumentProcessor {
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

  // 書類からデータを抽出
  public async extractDataFromDocument(document: DocumentFile): Promise<ExtractedDocumentData> {
    if (!this.hasAPIKey()) {
      throw new Error('OpenAI APIキーが設定されていません');
    }

    try {
      const prompt = this.buildExtractionPrompt(document);
      const response = await this.callChatGPT(prompt);
      const extractedData = this.parseExtractionResponse(response);
      
      return {
        ...extractedData,
        extractedAt: new Date(),
        confidence: extractedData.confidence || 0.8
      };
    } catch (error) {
      console.error('Document extraction error:', error);
      throw new Error(`書類の解析に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
    }
  }

  // 複数の書類から統合データを生成
  public async extractDataFromDocuments(documents: CandidateDocuments): Promise<ExtractedDocumentData> {
    const extractedDataList: ExtractedDocumentData[] = [];
    
    // 各書類からデータを抽出
    for (const [type, document] of Object.entries(documents)) {
      if (document && !Array.isArray(document)) {
        try {
          const extracted = await this.extractDataFromDocument(document);
          extractedDataList.push(extracted);
        } catch (error) {
          console.warn(`Failed to extract from ${type}:`, error);
        }
      }
    }

    // 複数の抽出結果を統合
    return this.mergeExtractedData(extractedDataList);
  }

  // 抽出データからフォームデータを生成
  public generateFormData(extractedData: ExtractedDocumentData): Record<string, string> {
    const formData: Record<string, string> = {};

    if (extractedData.personalInfo) {
      const info = extractedData.personalInfo;
      if (info.name) formData.name = info.name;
      if (info.age) formData.age = info.age.toString();
      if (info.education) formData.education = info.education;
      if (info.major) formData.major = info.major;
      if (info.contact?.email) formData.email = info.contact.email;
      if (info.contact?.phone) formData.phone = info.contact.phone;
    }

    if (extractedData.workExperience && extractedData.workExperience.length > 0) {
      const experienceText = extractedData.workExperience.map(exp => 
        `${exp.company} - ${exp.position} (${exp.period.start}〜${exp.period.end})\n` +
        `業務内容: ${exp.responsibilities.join(', ')}\n` +
        `実績: ${exp.achievements.join(', ')}`
      ).join('\n\n');
      formData.experience = experienceText;
    }

    if (extractedData.selfPr) {
      formData.selfPr = extractedData.selfPr;
    }

    return formData;
  }

  private buildExtractionPrompt(document: DocumentFile): string {
    return `
以下の${this.getDocumentTypeName(document.type)}から候補者の情報を抽出してください。

## 書類内容
${document.content}

## 抽出要求
以下の形式でJSONレスポンスを返してください：

{
  "personalInfo": {
    "name": "氏名",
    "age": 年齢（数値）,
    "education": "最終学歴",
    "major": "専攻分野",
    "contact": {
      "email": "メールアドレス",
      "phone": "電話番号",
      "address": "住所"
    }
  },
  "workExperience": [
    {
      "company": "会社名",
      "position": "役職・職種",
      "period": {
        "start": "開始年月",
        "end": "終了年月"
      },
      "responsibilities": ["業務内容1", "業務内容2"],
      "achievements": ["実績1", "実績2"],
      "skills": ["スキル1", "スキル2"]
    }
  ],
  "skills": ["スキル1", "スキル2", "スキル3"],
  "qualifications": ["資格1", "資格2"],
  "achievements": ["実績1", "実績2"],
  "selfPr": "自己PR・志望動機の内容",
  "motivations": ["志望理由1", "志望理由2"],
  "careerGoals": ["キャリア目標1", "キャリア目標2"],
  "confidence": 0.0-1.0の数値（抽出の信頼度）
}

## 注意事項
- 情報が記載されていない項目は空文字列または空配列にしてください
- 年齢は数値で抽出してください
- 期間は「YYYY年MM月」形式で統一してください
- 抽出の信頼度は、情報の明確さと完全性に基づいて設定してください
- 必ずJSON形式のみで回答し、他の文章は含めないでください
`;
  }

  private getDocumentTypeName(type: string): string {
    switch (type) {
      case 'resume': return '履歴書';
      case 'career_history': return '職務経歴書';
      case 'cover_letter': return '志望動機書';
      case 'portfolio': return 'ポートフォリオ';
      default: return '書類';
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
            content: 'あなたは経験豊富な人事担当者です。履歴書や職務経歴書から正確に情報を抽出し、必ずJSON形式で回答してください。'
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

  private parseExtractionResponse(response: string): ExtractedDocumentData {
    try {
      // JSONの抽出
      const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || response.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : response;
      
      const parsed = JSON.parse(jsonString);
      
      return {
        personalInfo: parsed.personalInfo || {},
        workExperience: Array.isArray(parsed.workExperience) ? parsed.workExperience : [],
        skills: Array.isArray(parsed.skills) ? parsed.skills : [],
        qualifications: Array.isArray(parsed.qualifications) ? parsed.qualifications : [],
        achievements: Array.isArray(parsed.achievements) ? parsed.achievements : [],
        selfPr: parsed.selfPr || '',
        motivations: Array.isArray(parsed.motivations) ? parsed.motivations : [],
        careerGoals: Array.isArray(parsed.careerGoals) ? parsed.careerGoals : [],
        extractedAt: new Date(),
        confidence: Math.max(0, Math.min(1, parsed.confidence || 0.5))
      };
    } catch (error) {
      console.error('Failed to parse extraction response:', error);
      throw new Error('抽出結果の解析に失敗しました');
    }
  }

  private mergeExtractedData(dataList: ExtractedDocumentData[]): ExtractedDocumentData {
    if (dataList.length === 0) {
      return {
        extractedAt: new Date(),
        confidence: 0
      };
    }

    if (dataList.length === 1) {
      return dataList[0];
    }

    // 複数のデータを統合
    const merged: ExtractedDocumentData = {
      personalInfo: {},
      workExperience: [],
      skills: [],
      qualifications: [],
      achievements: [],
      selfPr: '',
      motivations: [],
      careerGoals: [],
      extractedAt: new Date(),
      confidence: 0
    };

    // 個人情報の統合（最も信頼度の高いものを優先）
    const sortedByConfidence = [...dataList].sort((a, b) => b.confidence - a.confidence);
    merged.personalInfo = sortedByConfidence[0].personalInfo;

    // 配列データの統合（重複を除去）
    const allSkills = dataList.flatMap(d => d.skills || []);
    merged.skills = [...new Set(allSkills)];

    const allQualifications = dataList.flatMap(d => d.qualifications || []);
    merged.qualifications = [...new Set(allQualifications)];

    const allAchievements = dataList.flatMap(d => d.achievements || []);
    merged.achievements = [...new Set(allAchievements)];

    const allMotivations = dataList.flatMap(d => d.motivations || []);
    merged.motivations = [...new Set(allMotivations)];

    const allCareerGoals = dataList.flatMap(d => d.careerGoals || []);
    merged.careerGoals = [...new Set(allCareerGoals)];

    // 職歴の統合
    merged.workExperience = dataList.flatMap(d => d.workExperience || []);

    // 自己PRの統合（最も長いものを採用）
    const selfPrs = dataList.map(d => d.selfPr || '').filter(Boolean);
    merged.selfPr = selfPrs.reduce((longest, current) => 
      current.length > longest.length ? current : longest, '');

    // 信頼度の平均
    merged.confidence = dataList.reduce((sum, d) => sum + d.confidence, 0) / dataList.length;

    return merged;
  }
}