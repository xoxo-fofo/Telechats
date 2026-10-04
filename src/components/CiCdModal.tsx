import React, { useState } from 'react';
import { useTeleChats } from '../context/TeleChatsContext';
import {
  Smartphone,
  GitBranch,
  Terminal,
  Key,
  Copy,
  Check,
  Download,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  FileCode,
  Layers,
  ArrowRight
} from 'lucide-react';

export const CiCdModal: React.FC = () => {
  const { isCiCdOpen, setIsCiCdOpen } = useTeleChats();
  const [activeTab, setActiveTab] = useState<'pipeline' | 'android' | 'secrets' | 'git'>('pipeline');
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  if (!isCiCdOpen) return null;

  const copyText = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFile(key);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  const mainWorkflowCode = `name: TeleChats Main CI/CD - Build & Release Debug APK

on:
  push:
    branches:
      - main
  workflow_dispatch:

jobs:
  build-debug-apk:
    name: Build Telegram Client Android Debug APK
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Setup Node.js Environment
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install Frontend & Backend Dependencies
        run: npm ci

      - name: Inject MTProto Credentials & Build Web Assets
        env:
          VITE_TELEGRAM_API_ID: \${{ secrets.TELEGRAM_API_ID }}
          VITE_TELEGRAM_API_HASH: \${{ secrets.TELEGRAM_API_HASH }}
        run: npm run build

      - name: Setup Java Development Kit (JDK 17)
        uses: actions/setup-java@v4
        with:
          distribution: 'zulu'
          java-version: '17'

      - name: Setup Android SDK
        uses: android-actions/setup-android@v3

      - name: Prepare Android Webview Assets
        run: |
          mkdir -p android/app/src/main/assets/web
          cp -r dist/* android/app/src/main/assets/web/

      - name: Build Android Debug APK with Gradle
        run: |
          cd android
          if [ -f "gradlew" ]; then
            chmod +x gradlew
            ./gradlew assembleDebug --stacktrace
          else
            gradle assembleDebug --stacktrace
          fi

      - name: Create GitHub Release with Debug APK
        if: startsWith(github.ref, 'refs/heads/main')
        uses: softprops/action-gh-release@v2
        with:
          tag_name: v1.0.\${{ github.run_number }}-debug
          name: TeleChats Debug APK v1.0.\${{ github.run_number }}
          files: android/app/build/outputs/apk/debug/*.apk
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}`;

  const devWorkflowCode = `name: TeleChats Dev CI/CD - Build Dev APK & Webview Preview

on:
  push:
    branches:
      - dev
  pull_request:
    branches:
      - dev
  workflow_dispatch:

jobs:
  build-dev-apk-and-preview:
    name: Build Dev APK & Deploy Webview Preview
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Setup Node.js Environment
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Build Webview Preview Client
        env:
          VITE_APP_ENV: 'dev-preview'
        run: npm run build

      - name: Setup Java Development Kit (JDK 17)
        uses: actions/setup-java@v4
        with:
          distribution: 'zulu'
          java-version: '17'

      - name: Build Android Dev APK
        run: |
          cd android
          if [ -f "gradlew" ]; then
            chmod +x gradlew
            ./gradlew assembleDebug --stacktrace
          fi
          mv app/build/outputs/apk/debug/app-debug.apk app/build/outputs/apk/debug/telechats-dev-preview.apk || true

      - name: Upload Dev APK Artifact
        uses: actions/upload-artifact@v4
        with:
          name: telechats-dev-apk
          path: android/app/build/outputs/apk/debug/*.apk

      - name: Upload Webview Preview Artifact
        uses: actions/upload-artifact@v4
        with:
          name: telechats-webview-preview
          path: dist/`;

  const gitBashCommands = `# 1. Initialize Git repository and add remote
git init
git add .
git commit -m "feat: complete TeleChats MTProto client with CI/CD and WebRTC voice"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/TeleChats.git

# 2. Push to main branch (Triggers Debug APK build & GitHub Release)
git push -u origin main

# 3. Create and push to dev branch (Triggers Dev APK & Webview preview artifact)
git checkout -b dev
git push -u origin dev`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#17212b] border border-[#242f3d] w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#242f3d] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-900/40">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
                <span>Android CI/CD & Build Engine</span>
                <span className="text-[10px] bg-sky-950 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded-full font-mono">
                  GitHub Actions Ready
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Automated Android APK compilation on Android phone + GitHub Actions without a PC.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCiCdOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-[#242f3d] rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-4 border-b border-[#242f3d] bg-[#121b24] flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`py-3 px-3 text-xs font-medium border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'pipeline'
                ? 'border-[#5288c1] text-[#5288c1]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Branch Pipelines (main / dev)</span>
          </button>
          <button
            onClick={() => setActiveTab('secrets')}
            className={`py-3 px-3 text-xs font-medium border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'secrets'
                ? 'border-[#5288c1] text-[#5288c1]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>API Credentials Placement</span>
          </button>
          <button
            onClick={() => setActiveTab('android')}
            className={`py-3 px-3 text-xs font-medium border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'android'
                ? 'border-[#5288c1] text-[#5288c1]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Native Android Code (Kotlin)</span>
          </button>
          <button
            onClick={() => setActiveTab('git')}
            className={`py-3 px-3 text-xs font-medium border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'git'
                ? 'border-[#5288c1] text-[#5288c1]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Git Setup & Push Commands</span>
          </button>
        </div>

        {/* Tab 1: Pipelines */}
        {activeTab === 'pipeline' && (
          <div className="p-4 sm:p-6 overflow-y-auto no-scrollbar space-y-6 flex-1">
            {/* Rules Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Main Branch Card */}
              <div className="bg-[#0e1621] border border-[#242f3d] rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="font-mono text-xs font-bold text-emerald-400">
                      main Branch
                    </span>
                  </div>
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-mono">
                    Debug APK Release
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Pushes to <code className="text-emerald-400">main</code> automatically trigger GitHub Actions to run the Android Gradle build and publish a downloadable <strong>Debug APK</strong> attached to a GitHub Release.
                </p>
                <div className="text-[11px] font-mono text-slate-400 pt-1">
                  File: <code>.github/workflows/main-apk-release.yml</code>
                </div>
              </div>

              {/* Dev Branch Card */}
              <div className="bg-[#0e1621] border border-[#242f3d] rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                    <span className="font-mono text-xs font-bold text-sky-400">
                      dev Branch
                    </span>
                  </div>
                  <span className="text-[10px] bg-sky-950 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded font-mono">
                    Dev APK + Webview
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Pushes or PRs to <code className="text-sky-400">dev</code> trigger fast builds for <strong>Dev APK</strong> and package <strong>Webview Preview artifacts</strong> for rapid iterative testing directly on your phone.
                </p>
                <div className="text-[11px] font-mono text-slate-400 pt-1">
                  File: <code>.github/workflows/dev-apk-preview.yml</code>
                </div>
              </div>
            </div>

            {/* Workflow Code Previews */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-slate-300 font-mono">
                    .github/workflows/main-apk-release.yml
                  </span>
                  <button
                    onClick={() => copyText('mainWf', mainWorkflowCode)}
                    className="text-xs text-[#5288c1] hover:underline flex items-center gap-1 font-mono"
                  >
                    {copiedFile === 'mainWf' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedFile === 'mainWf' ? 'Copied!' : 'Copy Workflow'}</span>
                  </button>
                </div>
                <pre className="bg-[#0a0f16] border border-[#242f3d] rounded-xl p-3 text-[11px] font-mono text-emerald-300 max-h-52 overflow-y-auto no-scrollbar">
                  {mainWorkflowCode}
                </pre>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-slate-300 font-mono">
                    .github/workflows/dev-apk-preview.yml
                  </span>
                  <button
                    onClick={() => copyText('devWf', devWorkflowCode)}
                    className="text-xs text-[#5288c1] hover:underline flex items-center gap-1 font-mono"
                  >
                    {copiedFile === 'devWf' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedFile === 'devWf' ? 'Copied!' : 'Copy Workflow'}</span>
                  </button>
                </div>
                <pre className="bg-[#0a0f16] border border-[#242f3d] rounded-xl p-3 text-[11px] font-mono text-sky-300 max-h-52 overflow-y-auto no-scrollbar">
                  {devWorkflowCode}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: API Credentials Guide */}
        {activeTab === 'secrets' && (
          <div className="p-4 sm:p-6 overflow-y-auto no-scrollbar space-y-4 flex-1">
            <div className="bg-[#0e1621] border border-[#242f3d] rounded-xl p-4 space-y-3">
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>API Credentials Security & Placement Guide</span>
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                To keep your Telegram <code>API_ID</code> and <code>API_HASH</code> secure during automated GitHub Actions builds and backend execution:
              </p>

              <div className="space-y-3 pt-2">
                <div className="bg-[#17212b] p-3 rounded-lg border border-[#242f3d]">
                  <div className="font-semibold text-xs text-sky-300 mb-1">
                    1. Local Development (Express Backend)
                  </div>
                  <p className="text-xs text-slate-400 mb-2">
                    Create a <code>.env</code> file in your root server directory and define:
                  </p>
                  <pre className="bg-[#0a0f16] p-2 rounded text-xs font-mono text-emerald-300">
                    {`TELEGRAM_API_ID=your_api_id_here\nTELEGRAM_API_HASH=your_api_hash_here`}
                  </pre>
                  <p className="text-[11px] text-slate-400 mt-2">
                    ✓ Verified: <code>.env</code> is added to <code>.gitignore</code> so credentials are never publicly committed.
                  </p>
                </div>

                <div className="bg-[#17212b] p-3 rounded-lg border border-[#242f3d]">
                  <div className="font-semibold text-xs text-emerald-300 mb-1">
                    2. GitHub Actions Workflow (CI/CD Automated Builds)
                  </div>
                  <ol className="text-xs text-slate-400 space-y-1.5 list-decimal list-inside leading-relaxed">
                    <li>Go to your GitHub Repository → <strong>Settings</strong></li>
                    <li>Navigate to <strong>Secrets and variables</strong> → <strong>Actions</strong></li>
                    <li>Click <strong>New repository secret</strong> and add:
                      <ul className="list-disc list-inside pl-4 mt-1 space-y-1 text-slate-300 font-mono text-[11px]">
                        <li><code>TELEGRAM_API_ID</code></li>
                        <li><code>TELEGRAM_API_HASH</code></li>
                      </ul>
                    </li>
                    <li>The CI/CD pipeline in <code>.github/workflows/main-apk-release.yml</code> automatically injects them via <code>{'${{ secrets.TELEGRAM_API_ID }}'}</code> during Gradle APK build!</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Android Native Kotlin */}
        {activeTab === 'android' && (
          <div className="p-4 sm:p-6 overflow-y-auto no-scrollbar space-y-4 flex-1">
            <div className="bg-[#0e1621] border border-[#242f3d] rounded-xl p-4">
              <h4 className="text-sm font-semibold text-white mb-2">
                Native Android Kotlin WebView Architecture
              </h4>
              <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                TeleChats runs a custom Android container with WebChromeClient permissions for WebRTC microphone capture, Telegram deep-link intent filtering (<code>telechats.app/join/{'{code}'}</code>), and hardware acceleration.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono mb-4">
                <div className="bg-[#17212b] p-2 rounded border border-[#242f3d]">
                  <span className="text-slate-500 block text-[10px]">Package</span>
                  <span className="text-white text-xs truncate block">com.telechats.app</span>
                </div>
                <div className="bg-[#17212b] p-2 rounded border border-[#242f3d]">
                  <span className="text-slate-500 block text-[10px]">Min SDK</span>
                  <span className="text-white text-xs">Android 7.0 (API 24)</span>
                </div>
                <div className="bg-[#17212b] p-2 rounded border border-[#242f3d]">
                  <span className="text-slate-500 block text-[10px]">Target SDK</span>
                  <span className="text-white text-xs">Android 14 (API 34)</span>
                </div>
                <div className="bg-[#17212b] p-2 rounded border border-[#242f3d]">
                  <span className="text-slate-500 block text-[10px]">WebRTC Perms</span>
                  <span className="text-emerald-400 text-xs">Granted</span>
                </div>
              </div>

              <div className="text-xs text-slate-400 space-y-1 font-mono text-[11px]">
                <div>✓ <code>android/app/src/main/java/com/telechats/app/MainActivity.kt</code></div>
                <div>✓ <code>android/app/src/main/AndroidManifest.xml</code></div>
                <div>✓ <code>android/app/build.gradle</code></div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Git Commands */}
        {activeTab === 'git' && (
          <div className="p-4 sm:p-6 overflow-y-auto no-scrollbar space-y-4 flex-1">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-slate-300">
                  Ready-to-Run Git Terminal Commands (Android / Termux / PC)
                </span>
                <button
                  onClick={() => copyText('gitCmd', gitBashCommands)}
                  className="text-xs text-[#5288c1] hover:underline flex items-center gap-1 font-mono"
                >
                  {copiedFile === 'gitCmd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedFile === 'gitCmd' ? 'Copied!' : 'Copy Commands'}</span>
                </button>
              </div>
              <pre className="bg-[#0a0f16] border border-[#242f3d] rounded-xl p-3 text-xs font-mono text-emerald-300 leading-relaxed overflow-x-auto">
                {gitBashCommands}
              </pre>
            </div>

            <div className="bg-[#17212b] border border-[#242f3d] p-3.5 rounded-xl text-xs text-slate-300 space-y-1.5">
              <span className="font-semibold text-white block">Building using only an Android phone:</span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                You don't need Android Studio or a laptop! You can push your commits using <strong>Termux</strong> or GitHub Web/Mobile. The GitHub Actions cloud runner will build the APK and give you a direct download link on your phone in under 3 minutes!
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-[#242f3d] bg-[#121b24] flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">
            Pipeline: main (Debug APK) · dev (Dev APK + Webview)
          </span>
          <button
            onClick={() => setIsCiCdOpen(false)}
            className="px-4 py-2 bg-[#2b5278] hover:bg-[#346595] text-white text-xs font-medium rounded-xl transition-colors"
          >
            Close CI/CD Hub
          </button>
        </div>
      </div>
    </div>
  );
};
