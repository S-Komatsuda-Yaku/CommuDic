<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# CommuDic - AI Person Encyclopedia

**"複数の情報を、ひとつの物語へ。"**

CommuDicは、断片的な情報（テキスト、URL、PDF資料）から、その人の多面的な魅力を引き出し、プロフェッショナルな「人物図鑑」を生成するAIアプリケーションです。

## 🌟 Concept

履歴書だけでは伝わらない「人となり」や、SNSだけでは見えない「ビジネス適性」。
CommuDicは、Google Gemini 2.0 Flash のマルチモーダル機能を活用し、入力された複数の情報源を複合的に解析。その人の強み、価値観、そしてコミュニティでの役割を美しいビジュアルで可視化します。

## ✨ Key Features

- **Composite Multi-Input Analysis**: 
  - **Free Text**: 自己PRやエピソード
  - **Reference URL**: note記事やポートフォリオサイト
  - **Documents (PDF/Text)**: 職務経歴書やスライド資料
  これらを一度に読み込み、矛盾を解消しながら統合します。

- **Insightful AI Profiling**:
  - **Business Aptitude**: ワークスタイル、強み、適した役割
  - **Person & Community**: ソーシャルスタイル、大切にしている価値観、居心地の良い場所

- **Visual Feedback**:
  - レーダーチャートによる特性スコアリング
  - キャッチコピーと要約の自動生成

- **Shareable Results**:
  - 解析結果をSNS (X/Twitter) でシェア可能
  - 画像としての保存機能

## 🛠 Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS (Glassmorphism Design)
- **AI**: Google Gemini API (`gemini-2.5-flash`)
- **Backend / Database**: Supabase (Activity Logging)
- **Icons**: Lucide React

## 🚀 Run Locally

**Prerequisites:** Node.js (v18+)

1. **Clone the repository**
   ```bash
   git clone https://github.com/S-Komatsuda-Yaku/CommuDic.git
   cd CommuDic
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup Environment Variables**
   Create a `.env.local` file in the root directory:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the app**
   ```bash
   npm run dev
   ```

## 📄 License

This project is licensed under the MIT License.
