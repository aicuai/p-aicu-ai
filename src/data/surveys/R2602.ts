import type { SurveyConfig } from "./index"

export const R2602_CONFIG: SurveyConfig = {
  title: '生成AI時代の"つくる人"調査 2026.02',
  description: "あなたの創造が、AIと社会をつなぐデータになる。",
  sourceUrl: "https://j.aicu.ai/R2602",
  resolvedUrl: "https://docs.google.com/forms/d/e/1FAIpQLSevigf_OyxZUIRsW00zk-dWe15NccsoNekiQbGdlnvswuy2VQ/viewform",
  submitToGoogleForm: true,
  submitUrl: "/api/surveys/R2602",
  reward: "10,000 AICUポイント",
  estimatedMinutes: 5,
  questions: [
    // ── 同意 ──
    { id: "section_intro", type: "section", title: '生成AI時代の"つくる人"調査 2026.02', description: "あなたの創造が、AIと社会をつなぐデータになる。\n所要時間：約5分 / 匿名回答 / 10,000 AICUポイント贈呈\n\n前回調査結果: https://u.aicu.jp/r/R2511\n調査協力: 一般財団法人デジタルコンテンツ協会（DCAJ）\nhttps://www.dcaj.or.jp/privacy/" },
    { id: "entry_1127213393", entryId: 1127213393, type: "single_choice", question: "本調査結果のデータ利用方針についてご同意いただけますか？\nhttps://p.aicu.jp/q/R2602/policy", required: true, options: ["同意する","同意しない"] },

    // ── 基本情報 ──
    { id: "section_basic", type: "section", title: "あなたの基本情報" },
    { id: "entry_170746194", entryId: 170746194, type: "text", question: "生まれた年を西暦でお答えください", placeholder: "例: 1990", required: true },
    { id: "entry_1821980007", entryId: 1821980007, type: "single_choice", question: "あなたの性別を教えてください。", required: true, options: ["男性","女性","その他"] },
    { id: "entry_1957471882", entryId: 1957471882, type: "single_choice", question: "現在の職業を教えてください。", required: true, options: ["フリーランス・個人事業主","学生","会社員(非クリエイティブ)","会社員(クリエイティブ/製作系)","公務員","会社経営","団体職員","主婦・主夫","無職・休職中","その他"] },
    { id: "entry_1357554301", entryId: 1357554301, type: "dropdown", question: "お住まいの地域を教えてください。", required: true, options: ["北海道","青森県","岩手県","宮城県","秋田県","山形県","福島県","茨城県","栃木県","群馬県","埼玉県","千葉県","東京都","神奈川県","新潟県","富山県","石川県","福井県","山梨県","長野県","岐阜県","静岡県","愛知県","三重県","滋賀県","京都府","大阪府","兵庫県","奈良県","和歌山県","鳥取県","島根県","岡山県","広島県","山口県","徳島県","香川県","愛媛県","高知県","福岡県","佐賀県","長崎県","熊本県","大分県","宮崎県","鹿児島県","沖縄県","海外"] },

    // ── AIとの関わり方 ──
    { id: "section_ai", type: "section", title: "AIとの関わり方" },
    { id: "entry_1228619554", entryId: 1228619554, type: "multi_choice", question: "あなたの現在の主なAIとの関係で該当するものを選んでください。（複数選択可）", required: true, options: ["研究者・教育関係者","AI受容者・ファン","AIに強い関心があるが未利用","使ったことがない","アンチAI","AIアーティスト（AIを主要な創作手段として用いる）","AIディレクター／プロンプトデザイナー","AIプロデューサー（プロジェクト管理・企画・事業開発）","AI開発者（モデルトレーナー・アルゴリズム開発）","AIエンジニア（AIをつかって開発する役割）"] },
    { id: "entry_885269464", entryId: 885269464, type: "multi_choice", question: "あなたの主な所属セクター（最も近いもの）", required: false, options: ["個人クリエイター（フリー／副業含む・技術・PM系含む）","クリエイティブ企業（制作会社・広告代理店・ポスプロ等）","出版社（漫画・雑誌・書籍）","映画（制作・配給・宣伝）・映像・放送・通信","ゲーム／VTuber／配信プラットフォーム","教育機関・研究機関","行政・公共","製造業","ITサービス業","非ITサービス業","金融業","商社・物流・リテール","インフラ・建設・交通","退職/休職"] },
    { id: "entry_217192455", entryId: 217192455, type: "single_choice", question: "この1年間に、生成AIとどのような形で関与しましたか？", required: true, options: ["AI制作（作品・ツール開発など）","AIコンテンツの鑑賞・購入","どちらもしていない"] },

    // ── AI制作活動の実態 ──（AI利用者のみ）
    { id: "section_creation", type: "section", title: "AI制作活動の実態", skipIf: { questionId: "entry_217192455", equals: "どちらもしていない" } },
    { id: "entry_2077750738", entryId: 2077750738, type: "multi_choice", question: "主に関わっている生成AIの領域をすべて教えてください。（複数選択可）", required: true, options: ["画像生成（例：Midjourney, DALL·E, Stable Diffusion, ComfyUIなど）","音楽生成（例：Suno, Udio, Mubertなど）","テキスト生成（例：ChatGPT, Geminiなど）","動画生成（例：Runway, Pika, Sora, HiggsFieldなど）","コーディング支援（例：GitHub Copilotなど）","使用していないが興味がある"] },
    { id: "entry_35926345", entryId: 35926345, type: "single_choice", question: "この1年間で有償の実績（販売、受託、報酬の発生）がありましたか？", required: true, options: ["毎月（継続的な収益）","数ヶ月に1回（不定期な収益）","1回のみ（単発の収益）","有償実績はない"] },
    { id: "entry_274138831", entryId: 274138831, type: "single_choice", question: "この1年間のAI制作物に関する概算の売上帯を教えてください。", required: true, options: ["〜10万円未満","〜50万円未満","〜100万円未満","100万円以上","300万円以上","500万円以上"] },
    { id: "entry_1024046675", entryId: 1024046675, type: "single_choice", question: "月額のAIツール利用料（サブスク費用など）の月額合計は？", required: true, options: ["0円（無料の範囲）","月1,000円未満","月1,000〜5,000円","月5,000〜10,000円","月10,000～20,000円","月20,000円～30,000円","月30,000円～40,000円","月40,000円～50,000円","月50,000円以上"] },

    // ── 学習・制作環境 ──（AI利用者のみ）
    { id: "section_learning", type: "section", title: "学習・制作環境", skipIf: { questionId: "entry_217192455", equals: "どちらもしていない" } },
    { id: "entry_998532907", entryId: 998532907, type: "single_choice", question: "AIに関する学習・スキルアップのために投資した月額平均は？", required: true, options: ["0円（無料の範囲）","有償〜月1,000円未満","月1,000〜5,000円","月5,000〜10,000円","月10,000～20,000円","月20,000円～30,000円","月30,000円～40,000円","月40,000円～50,000円","月50,000円以上"] },
    { id: "entry_2000848438", entryId: 2000848438, type: "multi_choice", question: "生成AIに関する知識・スキルを主にどこで学んでいますか？\n複数選択可", required: true, options: ["コミュニティ","オンライン動画コンテンツ","Web上の技術記事・ブログ","書籍・電子書籍","独学","特に学んでいない"] },
    { id: "entry_653106127", entryId: 653106127, type: "single_choice", question: "生成AIに関する知識・スキルで\"最も\"役に立つものは？\nベストを1つ選択", required: true, options: ["コミュニティ","オンライン動画コンテンツ","Web上の技術記事・ブログ","書籍・電子書籍","独学","特に学んでいない"] },
    { id: "entry_1829344839", entryId: 1829344839, type: "multi_choice", question: "主に使用している制作環境（OS・ハードウェア）は？（複数選択可）", required: false, options: ["Windows 10以前","Windows 11","Copilot+ PC（AIアシスト搭載Windows）","AI PC（Neural Processing Unit搭載PCなど）","Mac","Linux環境","スマートフォン","タブレット","上記に該当しない・使っていない"] },
    { id: "entry_505387619", entryId: 505387619, type: "dropdown", question: "使用している制作環境（GPU・計算環境）でもっとも強力な設備は？", required: true, options: ["クラウド演算基盤用GPU（L4／A100／H100／B100等）","サーバー用GPU(GB10, GeForce RTX 6000 ada等)","GeForce RTX 5000シリーズ","GeForce RTX 4000シリーズ","GeForce RTX 3000シリーズ","GeForce RTX 2000シリーズ","GPU搭載なし","AMD Radeonシリーズ","Apple Silicon","クラウド環境（Google Colab, AWS, GCP, RunPod など）","わからない","上記に該当しない・使っていない"] },
    { id: "entry_1878680578", entryId: 1878680578, type: "multi_choice", question: "主に使用しているツール・サービスは？\n複数選択可（例はこちら: https://u.aicu.ai/R2602/tools ）", required: true, popularOptions: ["ChatGPT","ComfyUI","Midjourney","Stable Diffusion (SDXL等のオープンモデル)","Google Gemini(App/Web)","Claude","DALL·E","Sora(App)","Runway","Codex"], options: ["A1111","Adobe Photoshop","Adobe Premiere","Adobe After Effects","AICU.jp","CapCut","ChatGPT","Civitai","Claude","Codex","CoeFont","Comfy Cloud","ComfyUI","DALL·E","DaVinci Resolve","Dreamina","FAL","ElevenLabs","Envato","Final Cut Pro","Flux","freepik","Genspark","GitHub","Google Gemini(App/Web)","Google ImageFX","Google Whisk","Google Veo3","Google Nano Banana","Hailuo (MiniMax)","higgsfield.ai","HuggingFace","Kling","krea.ai","dzine.ai","florafauna.ai","filmora","Forge","Leonardo.ai","Midjourney","n8n","NijiJourney","seaart.ai","Sora(App)","Sora2(API)","Stable Diffusion (SDXL等のオープンモデル)","Stability AI","Suno","RunPod","Runway","Topaz Video AI","Udio","vidu","Wan.video","にじボイス"] },
    { id: "entry_230852343", entryId: 230852343, type: "single_choice", question: "サブスク料金の月額合計は？", required: true, options: ["0円（無料の範囲）","有償〜月1,000円未満","月1,000〜5,000円","月5,000〜10,000円","月10,000～20,000円","月20,000円～30,000円","月30,000円～40,000円","月40,000円～50,000円","月50,000円以上"] },

    // ── Q13 グリッド（各行が独立 entry ID）──（AI利用者のみ）
    { id: "section_impact", type: "section", title: "AI利用の効果", skipIf: { questionId: "entry_217192455", equals: "どちらもしていない" } },
    { id: "entry_134475126", entryId: 134475126, type: "multi_choice", question: "[AI利用の効果]「時間短縮の実現」について", required: false, options: ["現状「できている」","今後「伸ばしたい・期待したい」"] },
    { id: "entry_435926259", entryId: 435926259, type: "multi_choice", question: "[AI利用の効果]「品質の向上」について", required: false, options: ["現状「できている」","今後「伸ばしたい・期待したい」"] },
    { id: "entry_417935927", entryId: 417935927, type: "multi_choice", question: "[AI利用の効果]「新規受注への貢献」について", required: false, options: ["現状「できている」","今後「伸ばしたい・期待したい」"] },
    { id: "entry_2099945099", entryId: 2099945099, type: "multi_choice", question: "[AI利用の効果]「AI活用した業務フローの開発」について", required: false, options: ["現状「できている」","今後「伸ばしたい・期待したい」"] },
    { id: "entry_726998337", entryId: 726998337, type: "multi_choice", question: "[AI利用の効果]「明確な価値創出」について", required: false, options: ["現状「できている」","今後「伸ばしたい・期待したい」"] },
    { id: "entry_1709669206", entryId: 1709669206, type: "multi_choice", question: "[AI利用の効果]「AI関連企業への投資」について", required: false, options: ["現状「できている」","今後「伸ばしたい・期待したい」"] },
    { id: "entry_1030360033", entryId: 1030360033, type: "multi_choice", question: "[AI利用の効果]「コミュニティでの発信・コラボ機会の増加」について", required: false, options: ["現状「できている」","今後「伸ばしたい・期待したい」"] },
    { id: "entry_1294685535", entryId: 1294685535, type: "multi_choice", question: "[AI利用の効果]「クリエイティブ職への意欲やキャリア拡張」について", required: false, options: ["現状「できている」","今後「伸ばしたい・期待したい」"] },
    { id: "entry_1474230686", entryId: 1474230686, type: "multi_choice", question: "[AI利用の効果]「オープンソースなど共有技術開発への参加」について", required: false, options: ["現状「できている」","今後「伸ばしたい・期待したい」"] },

    // ── 態度・ボトルネック ──（AI利用者のみ）
    { id: "section_attitude", type: "section", title: "態度と課題", skipIf: { questionId: "entry_217192455", equals: "どちらもしていない" } },
    { id: "entry_34298640", entryId: 34298640, type: "single_choice", question: "AI利用に対するあなたの現在の態度に最も近いものは？", required: true, options: ["AIがなければ仕事・制作は成り立たない（必須）","AIは創作・仕事に不可欠だが、他の方法でも代替可能","AIは非常に便利だが、従来のやり方でも十分対応可能","AIはまだ自分の仕事には不要だと感じる","AIには懐疑的・不安を感じており、積極的に使っていない"] },
    { id: "entry_537892144", entryId: 537892144, type: "multi_choice", question: "AIの制作・利用におけるボトルネックを最大3つまで選択してください。", required: true, options: ["技術的な難しさ（学習コスト）","利用コストの高さ（サブスク・クレジット）","進化が速すぎる","学習情報の不足・情報の新陳代謝の速さ","著作権・倫理上の問題","成果物のクオリティ（破綻）の修正コスト","成果物に対する評価（安すぎる、価値が理解されない）","周囲の理解が得られないこと（所属組織の制限や文化）","チームでの利用の難しさ（複数人でのAI協働）","生成時間の長さ・計算リソースの不足（特に動画生成関連）","PCスペック・ハードウェアの費用","法規制・ガイドラインや監査の不明確さ","日本語対応や文化的能力の弱さ","その他"] },

    // ── DCAJ 深掘り質問（AI利用者のみ） ──
    { id: "section_dcaj", type: "section", title: "創作活動とAIの深掘り（DCAJ共同調査）", skipIf: { questionId: "entry_217192455", equals: "どちらもしていない" } },
    { id: "dcaj_Q1", type: "multi_choice", question: "現在の創作活動において、AIはどの工程で、どのような役割を果たしていますか。", required: true, options: ["企画・アイデア出し","ラフ制作・試作","本制作（成果物の生成）","修正・ブラッシュアップ","納品物の量産・バリエーション展開","クライアント説明・提案資料作成","学習・研究・検証目的","その他"] },
    { id: "dcaj_Q1a", type: "textarea", question: "上記で選んだ工程について、具体的な使い方やAIを使う理由があれば教えてください。", placeholder: "なぜそこにAIを使うのか、どう助かっているのか...", required: false },
    { id: "dcaj_Q2", type: "multi_choice", question: "AIを用いた作品について、ご自身はどのようにオリジナリティや作者性を捉えていますか。", required: false, options: ["「タイトル」を工夫する","プロンプトを工夫する","大量に生成して吟味する","詳細を作り込む","その他（自由記述）"] },
    { id: "dcaj_Q3", type: "multi_choice", question: "ご自身の作品がAIの学習データとして使われることについて、どう感じていますか。", required: true, options: ["非商用であれば許容できる","商用利用なら対価や許諾が必要","学習用途でも事前同意が必要","条件次第で許容できるが現状は不安","原則として望ましくない","よく分からない／判断が難しい"] },
    { id: "dcaj_Q3a", type: "multi_choice", question: "どの程度なら利用されてもよいと思いますか。条件があれば教えてください。", required: false, options: ["クレジット表示があれば許容","オプトアウトできれば許容","収益分配があれば許容","用途制限があれば許容","どんな条件でも不可","その他（自由記述）"] },
    { id: "dcaj_Q4", type: "multi_choice", question: "AIの普及によって、仕事の内容や報酬、評価のされ方に変化はありましたか。", required: false, options: ["仕事が速くなった","仕事が多くなった","報酬が増えた","報酬が減った","評価されるようになった","評価されなくなった","特に変化はない","その他（自由記述）"] },
    { id: "section_dcaj_ethics", type: "section", title: "倫理と制度", skipIf: { questionId: "entry_217192455", equals: "どちらもしていない" } },
    { id: "dcaj_Q5", type: "multi_choice", question: "AI生成コンテンツに対して、倫理的・社会的に懸念している点はありますか。", required: true, options: ["著作権・権利侵害","責任の所在が不明確","評価や価格の下落","誤情報・品質問題","炎上・社会的反発","国・業界ルールの未整備","特にない","その他"] },
    { id: "dcaj_Q5a", type: "textarea", question: "懸念点について、具体的な事例や理由があれば教えてください。", placeholder: "経験談や想定ケースなど...", required: false },
    { id: "dcaj_Q6", type: "single_choice", question: "現在の法律や業界ルールについて、十分だと感じますか。", required: true, options: ["十分だと思う","一部は対応できているが不足している","不足していると感じる","分からない"] },
    { id: "dcaj_Q6a", type: "multi_choice", question: "どういったルール設計が望ましいと思いますか。", required: false, options: ["AI生成物の表示義務","学習データの透明化","契約標準の整備","報酬分配の仕組み","第三者監査制度","その他（自由記述）"] },
    { id: "section_dcaj_future", type: "section", title: "クリエイターの価値と支援", skipIf: { questionId: "entry_217192455", equals: "どちらもしていない" } },
    { id: "dcaj_Q7", type: "multi_choice", question: "AI時代において、人間のクリエイターにしか担えない価値は何だと思いますか。", required: false, options: ["意図を持つこと（なぜそれを作るのかという動機・使命）","責任を引き受けること（社会的・倫理的・法的責任）","文脈を読む力（文化・歴史・空気感を踏まえた判断）","身体性に根ざした表現（体験・感情・感覚に裏打ちされた創作）","当事者性（自分の人生や立場から語るリアリティ）","価値判断と編集（何を選び、何を捨てるかを決める力）","問いを立てる力（まだ言語化されていない問題を発見する力）","関係性を築く力（共感・信頼・コミュニティ形成）","越境と統合（異分野・異文化をつなぎ直す構想力）","リスクを取る決断（失敗や批判を引き受ける覚悟）","物語を生きること（創作と人生が接続していること）","未来へのビジョン提示（まだ存在しない社会像を描く力）","その他（自由記述）"] },
    { id: "dcaj_Q8", type: "multi_choice", question: "国の支援として、どんなことがあるとあなたの生成AI作品を安心して展開できますか？", required: false, options: ["ガイドラインの整備","法的相談窓口の設置","契約書テンプレートの提供","補助金・助成金制度","AI作品の認証制度","教育・研修プログラム","その他（自由記述）"] },
    { id: "dcaj_Q9", type: "multi_choice", question: "特に、作品や素材を海外展開する際に欲しい支援等はありますか？", required: false, options: ["各国の法制度情報の提供","契約書・ライセンスの多言語化支援","翻訳・ローカライズ支援","海外マーケットプレイスへの出展支援","国際的な権利保護の枠組み","その他（自由記述）"] },
    // Note: DCAJ Q10 (ヒアリング協力) is excluded — R2602 already has entry_1667631330

    // ── 教育・証明 ──（AI利用者のみ）
    { id: "section_cert", type: "section", title: "教育・証明ニーズ", skipIf: { questionId: "entry_217192455", equals: "どちらもしていない" } },
    { id: "entry_282284746", entryId: 282284746, type: "single_choice", question: "AI業務案件におけるスキル・倫理・マネジメント教育サービスがあれば利用したいですか？", required: true, options: ["ぜひ利用したい","内容によっては利用したい","関心はあるが現時点では不要","利用しないと思う","既に類似サービスを利用している"] },
    { id: "entry_1533319614", entryId: 1533319614, type: "single_choice", question: "証明書（スキル・倫理・マネジメント）発行サービスがあれば利用したいですか？", required: true, options: ["ぜひ利用したい","内容によっては利用したい","関心はあるが現時点では不要","利用しないと思う","既に類似サービスを利用している"] },
    { id: "entry_722928489", entryId: 722928489, type: "multi_choice", question: "価値を感じる証明内容は？（複数選択可）", required: true, options: ["著作権をはじめとする法令理解（知識証明）","作品の真正性・モデルやプロンプトなど来歴の証明（作品製作証明書）","プロンプト設計力・創造性・応用力","マネジメント能力・ディレクション能力（業務経歴書）","責任あるAIの使い手である倫理観と宣誓証明","協働実績","コミュニティ貢献","有名な方の推薦文","案件の価格（客観的な評価）","修了証より作品ごとの証明書に関心が高い"] },

    // ── 発表・権利 ──（AI利用者のみ）
    { id: "section_publish", type: "section", title: "発表と権利", skipIf: { questionId: "entry_217192455", equals: "どちらもしていない" } },
    { id: "entry_333973041", entryId: 333973041, type: "multi_choice", question: "AI作品を公開・発表する際の主なプラットフォームは？（複数選択可）", required: true, options: ["X.com","Instagram / TikTok (SNS)","YouTube / Vimeo (動画プラットフォーム)","note / ブログ","Pixiv / ArtStation (イラスト・アート系)","Booth / Coconala (マーケットプレイス・販売サイト)","自分のウェブサイト / ポートフォリオサイト","特定のコミュニティ内のみ","公開していない","その他"] },
    { id: "entry_259625141", entryId: 259625141, type: "single_choice", question: "AI作家・他者の応援予算は？", required: true, options: ["支払わない","〜1,000円/月","〜3,000円/月","〜5,000円/月","〜10,000円/月","それ以上"] },
    { id: "entry_363161546", entryId: 363161546, type: "multi_choice", question: "作品印刷物にQRコードで動画へリンクがある場合、どの媒体で関心がありますか？", required: true, options: ["名刺","年賀状・ポストカード","ポスター・チラシ・カタログ","履歴書・ポートフォリオ","展示（ギャラリー・即売会・イベント）","使わない"] },
    { id: "entry_448099795", entryId: 448099795, type: "single_choice", question: "AIで作った作品を他者が二次創作として利用する場合、どの条件を望みますか？", required: true, options: ["非商用は許諾（表示・共有OK）、商用は個別許諾","商用も含め個別に契約・許諾したい","加工(リミックス)は許可、再学習（機械学習データ）は不可","加工(リミックス)・再学習（機械学習データ）も無断で許諾可","一切許諾したくない（私的利用の範囲のみ希望）","よく分からない／ルールは未定"] },
    { id: "entry_454206106", entryId: 454206106, type: "single_choice", question: "AIツールの著作権について、あなたの考えに最も近いものは？", required: true, options: ["AIツールの著作権はツール利用者(あなた自身)が解決すべきだ","AIツールの著作権はツール提供者(OpenAIやGoogle)が解決すべきだ","AIツールの生成物に著作権はないと考える"] },

    // ── AI未利用者向け ──（非利用者のみ表示）
    { id: "section_nonuser", type: "section", title: "AIを利用していない方へ", skipIf: { questionId: "entry_217192455", notEquals: "どちらもしていない" } },
    { id: "entry_953637123", entryId: 953637123, type: "multi_choice", question: "この1年間でAIの制作・利用を開始しなかった主な理由を最大3つまで教えてください。", required: true, options: ["技術的な難しさ（学習コスト）","利用コストの高さ（サブスク・クレジット）","情報が見つからない・信憑性がない","著作権・倫理上の問題","自分の仕事にはまだ不要だと感じた","何から始めていいか分からない"] },

    // ── あなたの声 ──
    { id: "section_voice", type: "section", title: "あなたの声" },
    { id: "entry_388832134", entryId: 388832134, type: "textarea", question: "生成AIを使って「よかった」と感じた体験を教えてください。", placeholder: "自由にお書きください...", required: false },
    { id: "entry_1784426158", entryId: 1784426158, type: "textarea", question: '「調査してほしい要素」や「おすすめのサービス」があれば教えてください。', placeholder: "URLも歓迎です...", required: false },
    { id: "entry_1667631330", entryId: 1667631330, type: "single_choice", question: "今後、AICUが行うインタビュー調査に協力してもよいですか？", required: true, options: ["はい","いいえ"] },
    { id: "entry_611811208", entryId: 611811208, type: "textarea", question: "本調査への質問やメッセージがございましたらご記入ください。", placeholder: "ご意見をお聞かせください...", required: false },

    // ── 報酬受取 ──
    { id: "section_reward", type: "section", title: "報酬の受け取り", description: "ポイント付与やインタビューにご協力いただける方は、メールアドレスをご入力ください。" },
    { id: "entry_1243761143", entryId: 1243761143, type: "text", question: "メールアドレス（AICU.jp での登録メールアドレス）\nご登録のアドレスに謝礼を送付します", placeholder: "you@example.com", required: false },
  ],
}
