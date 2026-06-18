import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, ShieldAlert, Check, Copy, Terminal, ExternalLink, Sliders, Play, Settings, Compass } from 'lucide-react';
import { User } from '../types';

interface GmailIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  activeUser: User | null;
  onSuccessToast: (msg: string) => void;
  onTaskCreated: () => void;
}

export default function GmailIntegrationModal({
  isOpen,
  onClose,
  users,
  activeUser,
  onSuccessToast,
  onTaskCreated
}: GmailIntegrationModalProps) {
  const [activeTab, setActiveTab] = useState<'script' | 'extension'>('script');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  
  // Custom interactive simulation state
  const [simSubject, setSimSubject] = useState('Urgent: Balance Sheet Reconciliation for May');
  const [simAssignee, setSimAssignee] = useState(users[1]?.email || 'sarah.dev@foundationworldschool.com');
  const [simRunning, setSimRunning] = useState(false);

  if (!isOpen) return null;

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://ais-dev-...';
  const senderEmail = activeUser?.email || 'manager.accounts@foundationworldschool.com';

  // Format dynamic Apps Script file
  const appsScriptCode = `/**
 * Google Apps Script: "Add to Secure Tasks" Gmail MenuItem
 * Paste this into Code.gs inside script.google.com and save.
 * Connected dynamically to: ${currentOrigin}
 */

function onGmailOpen(e) {
  try {
    var accessToken = e.gmail.accessToken;
    GmailApp.setCurrentMessageAccessToken(accessToken);
    
    var messageId = e.gmail.messageId;
    var message = GmailApp.getMessageById(messageId);
    var subject = message.getSubject() || "No Subject";
    var threadId = message.getThread().getId();
    var threadUrl = "https://mail.google.com/mail/u/0/#inbox/" + threadId;
    
    var card = CardService.newCardBuilder();
    card.setHeader(CardService.newCardHeader().setTitle("📩 Task Assigner Sync"));
    
    var section = CardService.newCardSection()
        .setHeader("Email Contextual Details")
        .addWidget(CardService.newKeyValue()
          .setMultiline(true)
          .setTopLabel("Subject")
          .setContent(subject))
        .addWidget(CardService.newKeyValue()
          .setMultiline(true)
          .setTopLabel("Gmail URL")
          .setContent(threadUrl));
          
    // Add assignment selector
    var selectionInput = CardService.newSelectionInput()
        .setType(CardService.SelectionInputType.DROPDOWN)
        .setFieldName("assignee_email")
        .setTitle("Select Team Assignee");
        
    // Read from dynamically available sandbox roles
    selectionInput.addItem("${senderEmail}", "${senderEmail}", true);
    selectionInput.addItem("${simAssignee}", "${simAssignee}", false);
    
    section.addWidget(selectionInput);
          
    // Action trigger for zero-trust request dispatch
    var syncAction = CardService.newAction()
        .setFunctionName("syncEmailToWorkspaceAction")
        .setParameters({
          "subject": subject,
          "threadUrl": threadUrl
        });
        
    var button = CardService.newTextButton()
        .setText("🚀 Dispatch to Task Workspace")
        .setOnClickAction(syncAction);
        
    section.addWidget(CardService.newButtonSet().addButton(button));
    card.addSection(section);
    
    return [card.build()];
  } catch (err) {
    // Beautiful fallback error card
    var errorCard = CardService.newCardBuilder();
    errorCard.setHeader(CardService.newCardHeader().setTitle("❌ Error Initializing Add-on"));
    var errSection = CardService.newCardSection()
        .addWidget(CardService.newTextParagraph().setText("Make sure to grant access to the add-on in Gmail settings.\\n\\nDetails: " + err.toString()));
    errorCard.addSection(errSection);
    return [errorCard.build()];
  }
}

function syncEmailToWorkspaceAction(e) {
  var subject = e.parameters.subject;
  var threadUrl = e.parameters.threadUrl;
  var selectedAssignee = e.formInput.assignee_email || "${simAssignee}";
  
  var success = createSecureTaskFromEmail(subject, threadUrl, selectedAssignee);
  
  var notification = CardService.newNotification();
  if (success) {
    notification.setText("🔥 Task successfully synchronized in Zero-Trust Database!");
  } else {
    notification.setText("⚠️ Connection refused. Verify workspace server logs.");
  }
  
  return CardService.newActionResponseBuilder()
      .setNotification(notification)
      .build();
}

// REST Client integration handler
function createSecureTaskFromEmail(subject, threadUrl, assigneeEmail) {
  var apiEndpoint = "${currentOrigin}/api/tasks";
  var payload = {
    title: "📧 Gmail: " + subject,
    description: "Attached secure thread guidelines tracker. \\nGmail Reference URL: " + threadUrl,
    assigneeId: assigneeEmail || "${simAssignee}",
    startDate: new Date().toISOString(),
    deadline: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString() // 48h limit
  };
  
  var options = {
    method: "POST",
    contentType: "application/json",
    headers: {
      "x-user-email": "${senderEmail}"
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  try {
    var response = UrlFetchApp.fetch(apiEndpoint, options);
    var responseCode = response.getResponseCode();
    Logger.log("Task synchronized in zero-trust ledger: " + response.getContentText() + " (Code: " + responseCode + ")");
    return responseCode >= 200 && responseCode < 300;
  } catch (err) {
    Logger.log("Synchronizer network failure: " + err.toString());
    return false;
  }
}`;

  const appsscriptManifest = `{
  "timeZone": "GMT",
  "dependencies": {},
  "exceptionLogging": "STACKDRIVER",
  "oauthScopes": [
    "https://www.googleapis.com/auth/gmail.addons.execute",
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/script.external_request",
    "https://www.googleapis.com/auth/gmail.addons.current.message.readonly"
  ],
  "runtimeVersion": "V8",
  "gmail": {
    "name": "Secure Task Assigner",
    "logoUrl": "https://www.gstatic.com/images/icons/material/system/1x/mail_outline_black_24dp.png",
    "contextualTriggers": [
      {
        "unconditional": {},
        "onTriggerFunction": "onGmailOpen"
      }
    ],
    "primaryColor": "#6366f1",
    "secondaryColor": "#d946ef"
  }
}`;

  // Extension background scripts instructions
  const chromeManifest = `{
  "manifest_version": 3,
  "name": "Gmail To Secure Task Assigner",
  "version": "1.0",
  "description": "Bridges Gmail threads to your Secure Task Assigner Suite with 1-click",
  "permissions": ["activeTab"],
  "content_scripts": [
    {
      "matches": ["https://mail.google.com/*"],
      "js": ["content.js"]
    }
  ]
}`;

  const chromeContentScript = `// content.js - Injected into Gmail
const API_URL = "${currentOrigin}";
const SENDER_EMAIL = "${senderEmail}";

// Injects an elegant "+ Send to Tasks" button next to email headers
function injectGmailTaskButton() {
  const subjectHeaders = document.querySelectorAll('h2.hP');
  subjectHeaders.forEach(header => {
    if (header.nextSibling && header.nextSibling.id === 'gmail-task-btn') return;
    
    const btn = document.createElement('button');
    btn.id = 'gmail-task-btn';
    btn.innerText = '📩 Add to Tasks';
    btn.style.cssText = "margin-left: 15px; padding: 4px 10px; font-size: 11px; font-weight: bold; font-family: monospace; color: #fff; background: linear-gradient(135deg, #6366f1, #d946ef); border: none; border-radius: 6px; cursor: pointer; transition: all 0.2s;";
    
    btn.onclick = async () => {
      btn.innerText = '⌛ Sending...';
      const mailSubject = header.innerText;
      const mailUrl = window.location.href;
      
      try {
        const response = await fetch(\`\${API_URL}/api/tasks\`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-email': SENDER_EMAIL
          },
          body: JSON.stringify({
            title: "📧 Gmail: " + mailSubject,
            description: "Direct secure linkage from Gmail inbox.\\nURL: " + mailUrl,
            assigneeId: "${simAssignee}",
            startDate: new Date().toISOString(),
            deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          })
        });
        
        if (response.ok) {
          btn.innerText = '✅ Attached!';
          btn.style.background = '#10b981';
        } else {
          btn.innerText = '❌ Failed';
        }
      } catch (err) {
        btn.innerText = '⚠️ Network Error';
      }
    };
    
    header.parentNode.insertBefore(btn, header.nextSibling);
  });
}

// Watch for DOM changes when switching emails
const observer = new MutationObserver(injectGmailTaskButton);
observer.observe(document.body, { childList: true, subtree: true });`;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    onSuccessToast(`📋 ${label} copied to clipboard!`);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleSimulateClick = async () => {
    if (simRunning) return;
    setSimRunning(true);
    onSuccessToast("⚡ Executing Apps Script triggers...");

    // Simulate Apps Script delay
    setTimeout(async () => {
      try {
        const response = await fetch(`${currentOrigin}/api/tasks`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-email': senderEmail
          },
          body: JSON.stringify({
            title: `📧 Gmail: ${simSubject}`,
            description: `Auto-attached thread via Gmail Sync Connector Integration.\nSimulated Link: https://mail.google.com/mail/u/0/#inbox/simulated_thread_id_99`,
            assigneeId: simAssignee,
            startDate: new Date().toISOString(),
            deadline: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
          })
        });

        if (response.ok) {
          onSuccessToast(`🔥 Succesfully created task from virtual Gmail Thread!`);
          onTaskCreated();
        } else {
          onSuccessToast(`⚠️ Simulation api failure. Check if user roles are fully authorized.`);
        }
      } catch (err) {
        onSuccessToast(`❌ Network failure during integration request simulation.`);
      } finally {
        setSimRunning(false);
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div 
        className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-[0_20px_50px_rgba(99,102,241,0.25)] flex flex-col max-h-[90vh] relative"
        id="gmail_integration_container"
      >
        {/* Colorful Gradient Border */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-red-500 via-indigo-500 via-purple-500 to-pink-500" />

        {/* Modal Header */}
        <div className="p-5 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-950/65 border border-red-800/80 rounded-xl text-red-400">
              <Mail className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-display font-black text-white text-lg leading-tight flex items-center gap-2">
                Gmail "Add to Tasks" Workspace Integration
              </h3>
              <p className="text-[11px] font-mono text-zinc-400">
                Generate native bridges from your real Gmail inbox to this workspace URL
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-100 bg-zinc-800 hover:bg-zinc-750 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body Scroll */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-zinc-300">
          
          <div className="p-4 rounded-xl bg-orange-950/15 border border-orange-500/20 text-orange-300 leading-relaxed text-xs">
            <div className="font-bold flex items-center gap-1.5 mb-1 text-[13px]">
              <ShieldAlert className="w-4 h-4 text-orange-400" />
              <span>Gmail Drag & Drop Constraint Tip</span>
            </div>
            Standard browsers block dragging raw tabs/mail rows directly between isolated website iframes due to privacy policies. 
            Use either of these two custom, lightweight workspace connectors to add a native email integration click handler!
          </div>

          {/* Quick Selection Tab Buttons */}
          <div className="grid grid-cols-2 gap-3 p-1.5 bg-zinc-950 rounded-2xl border border-zinc-900">
            <button
              onClick={() => setActiveTab('script')}
              className={`p-2.5 rounded-xl font-mono text-xs font-black uppercase tracking-wider transition ${
                activeTab === 'script' 
                  ? 'bg-gradient-to-r from-indigo-500/15 to-purple-500/15 text-indigo-300 border border-indigo-500/30 shadow-inner' 
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
              }`}
            >
              Method 1: Gmail Apps Script (Recommended)
            </button>
            <button
              onClick={() => setActiveTab('extension')}
              className={`p-2.5 rounded-xl font-mono text-xs font-black uppercase tracking-wider transition ${
                activeTab === 'extension' 
                  ? 'bg-gradient-to-r from-pink-500/15 to-purple-500/15 text-pink-300 border border-pink-500/30 shadow-inner' 
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
              }`}
            >
              Method 2: Custom Chrome Extension
            </button>
          </div>

          {activeTab === 'script' ? (
            <div className="space-y-6">
              {/* Visual Multi-step Progress Bar Indicator */}
              <div className="p-4 bg-zinc-950/40 rounded-2xl border border-zinc-850/60">
                <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest block mb-3 font-bold text-center">
                  Follow This 3-Phase Interactive Code Setup
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-indigo-950/40 border border-indigo-500/25 p-2 rounded-xl text-center">
                    <span className="block font-sans font-bold text-[11px] text-indigo-300">Phase 1: Project Setup</span>
                    <span className="text-[9px] font-mono text-zinc-500">Steps 1-3</span>
                  </div>
                  <div className="bg-purple-950/20 border border-purple-500/10 p-2 rounded-xl text-center">
                    <span className="block font-sans font-bold text-[11px] text-purple-400">Phase 2: Code Paste</span>
                    <span className="text-[9px] font-mono text-zinc-500">Steps 4-5</span>
                  </div>
                  <div className="bg-emerald-950/20 border border-emerald-500/10 p-2 rounded-xl text-center">
                    <span className="block font-sans font-bold text-[11px] text-emerald-400">Phase 3: Activate Live</span>
                    <span className="text-[9px] font-mono text-zinc-500">Step 6 & Enjoy</span>
                  </div>
                </div>
              </div>

              {/* Detailed Steps */}
              <div className="space-y-4">
                <span className="font-extrabold text-xs text-white uppercase font-mono tracking-wider text-indigo-400 flex items-center gap-2">
                  <Settings className="w-4 h-4 text-indigo-400" />
                  👶 Step-By-Step Beginner's Guide (Follow Carefully)
                </span>

                <div className="grid grid-cols-1 gap-3.5">
                  {/* Step 1 */}
                  <div className="flex gap-3 p-3.5 bg-zinc-950/65 border border-zinc-850 rounded-2xl hover:border-zinc-800 transition">
                    <div className="w-7 h-7 flex-shrink-0 bg-indigo-600/15 border border-indigo-500/30 text-indigo-300 text-xs font-black rounded-xl flex items-center justify-center font-mono">
                      01
                    </div>
                    <div className="text-xs space-y-1.5 leading-relaxed">
                      <p className="font-bold text-zinc-100 flex items-center gap-1.5">
                        Open Google Script Workspace
                      </p>
                      <p className="text-zinc-400">
                        Click this direct link: <a href="https://script.google.com" target="_blank" rel="noreferrer" className="text-indigo-400 font-extrabold underline inline-flex items-center gap-0.5 hover:text-indigo-300">script.google.com <ExternalLink className="w-3 h-3" /></a>. If prompted, sign in with your Gmail account. Once open, click the big <strong className="text-zinc-200">"New Project"</strong> button in the top-left.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex gap-3 p-3.5 bg-zinc-950/65 border border-zinc-850 rounded-2xl hover:border-zinc-800 transition">
                    <div className="w-7 h-7 flex-shrink-0 bg-indigo-600/15 border border-indigo-500/30 text-indigo-300 text-xs font-black rounded-xl flex items-center justify-center font-mono">
                      02
                    </div>
                    <div className="text-xs space-y-1.5 leading-relaxed">
                      <p className="font-bold text-zinc-100">
                        Enable Hidden Settings (Super Important!)
                      </p>
                      <p className="text-zinc-400">
                        On the far left column menu, click the <strong className="text-zinc-200">Project Settings</strong> (the gear icon ⚙️). Scroll down to the middle and check the box that says: <strong className="text-indigo-300 font-extrabold">"Show \"appsscript.json\" manifest file in editor"</strong>.
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex gap-3 p-3.5 bg-zinc-950/65 border border-zinc-850 rounded-2xl hover:border-zinc-800 transition">
                    <div className="w-7 h-7 flex-shrink-0 bg-indigo-600/15 border border-indigo-500/30 text-indigo-300 text-xs font-black rounded-xl flex items-center justify-center font-mono">
                      03
                    </div>
                    <div className="text-xs space-y-1.5 leading-relaxed">
                      <p className="font-bold text-zinc-100">
                        Go back to Code Editor
                      </p>
                      <p className="text-zinc-400">
                        On the left, click the top <strong className="text-zinc-200">Editor</strong> button (the code symbol <code className="text-zinc-300 font-bold">&lt;&gt;</code>) to see your files list. You will now see two files: <code className="text-indigo-300 font-mono text-[11px] px-1 py-0.5 bg-zinc-950 rounded">Code.gs</code> and <code className="text-indigo-300 font-mono text-[11px] px-1 py-0.5 bg-zinc-950 rounded">appsscript.json</code>.
                      </p>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="flex gap-3 p-3.5 bg-zinc-950/65 border border-zinc-850 rounded-2xl hover:border-zinc-800 transition">
                    <div className="w-7 h-7 flex-shrink-0 bg-purple-600/15 border border-purple-500/30 text-purple-300 text-xs font-black rounded-xl flex items-center justify-center font-mono">
                      04
                    </div>
                    <div className="text-xs space-y-1.5 leading-relaxed">
                      <p className="font-bold text-zinc-100 flex items-center gap-1 text-purple-400">
                        Configure "appsscript.json"
                      </p>
                      <p className="text-zinc-400">
                        Inside the editor, click on <code className="text-zinc-100 font-mono">appsscript.json</code>. Erase everything inside it, click the <strong className="text-zinc-200">"Copy Manifest"</strong> button below, and paste this new code in!
                      </p>
                    </div>
                  </div>

                  {/* Step 5 */}
                  <div className="flex gap-3 p-3.5 bg-zinc-950/65 border border-zinc-850 rounded-2xl hover:border-zinc-800 transition">
                    <div className="w-7 h-7 flex-shrink-0 bg-purple-600/15 border border-purple-500/30 text-purple-300 text-xs font-black rounded-xl flex items-center justify-center font-mono">
                      05
                    </div>
                    <div className="text-xs space-y-1.5 leading-relaxed">
                      <p className="font-bold text-zinc-100 text-purple-400">
                        Configure "Code.gs"
                      </p>
                      <p className="text-zinc-400">
                        Now, click on the <code className="text-zinc-100 font-mono">Code.gs</code> file in the editor. Erase everything there, click the <strong className="text-zinc-200">"Copy Code"</strong> button below, and paste it. Then click the <strong className="text-zinc-200">Save</strong> button (the floppy disk floppy icon 💾 at the top center).
                      </p>
                    </div>
                  </div>

                  {/* Step 6 */}
                  <div className="flex gap-3 p-3.5 bg-zinc-950/65 border border-zinc-850 rounded-2xl hover:border-zinc-850 transition">
                    <div className="w-7 h-7 flex-shrink-0 bg-emerald-600/15 border border-emerald-500/30 text-emerald-300 text-xs font-black rounded-xl flex items-center justify-center font-mono animate-bounce">
                      06
                    </div>
                    <div className="text-xs space-y-1.5 leading-relaxed">
                      <p className="font-bold text-emerald-400 flex items-center gap-1.5">
                        Deploy & Match with Gmail!
                      </p>
                      <p className="text-zinc-400">
                        Click the top-right blue <strong className="text-zinc-200">"Deploy"</strong> dropdown button and select <strong className="text-emerald-300">"Test deployments"</strong>. On the window that pops up, verify the type is <strong>"Google Workspace Add-on"</strong>, and click the blue <strong>"Install"</strong> button. You are ready! Open any Gmail email, and you will see your new button in the right-side companion bar.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Manifest block */}
              <div className="border border-zinc-800 rounded-2xl bg-zinc-950 overflow-hidden relative">
                <div className="p-3 bg-zinc-900/50 border-b border-zinc-800/80 flex justify-between items-center text-xs">
                  <span className="font-mono text-zinc-300 flex items-center gap-1.5 font-bold">
                    <Sliders className="w-4 h-4 text-emerald-400" /> appsscript.json (Add-on Manifest)
                  </span>
                  <button
                    onClick={() => copyToClipboard(appsscriptManifest, 'manifest.json')}
                    className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-[10px] text-zinc-300 hover:text-white font-mono rounded flex items-center gap-1.5 transition uppercase font-bold"
                  >
                    {copiedText === 'manifest.json' ? <Check className="w-3 text-emerald-400" /> : <Copy className="w-3" />}
                    {copiedText === 'manifest.json' ? 'Copied' : 'Copy Manifest'}
                  </button>
                </div>
                <pre className="p-4 overflow-x-auto text-[11px] font-mono text-zinc-400 max-h-36 leading-tight whitespace-pre select-all">
                  {appsscriptManifest}
                </pre>
              </div>

              {/* Code Panel */}
              <div className="border border-zinc-800 rounded-2xl bg-zinc-950 overflow-hidden relative">
                <div className="p-3 bg-zinc-900/50 border-b border-zinc-800/80 flex justify-between items-center text-xs">
                  <span className="font-mono text-indigo-300 flex items-center gap-1.5 font-bold">
                    <Terminal className="w-4 h-4" /> Code.gs (Apps Script Engine)
                  </span>
                  <button
                    onClick={() => copyToClipboard(appsScriptCode, 'Apps Script code')}
                    className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-[10px] text-zinc-300 hover:text-white font-mono rounded flex items-center gap-1.5 transition uppercase font-bold"
                  >
                    {copiedText === 'Apps Script code' ? <Check className="w-3 text-emerald-400" /> : <Copy className="w-3" />}
                    {copiedText === 'Apps Script code' ? 'Copied' : 'Copy Code'}
                  </button>
                </div>
                <pre className="p-4 overflow-x-auto text-[11px] font-mono text-zinc-400 max-h-48 leading-relaxed whitespace-pre select-all">
                  {appsScriptCode}
                </pre>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <span className="font-black text-xs text-white uppercase font-mono tracking-wide text-pink-400 block">
                  🛠️ Chrome Extension Installation Guide
                </span>
                <ol className="list-decimal list-inside space-y-1 text-xs text-zinc-400 pl-1">
                  <li>Create an empty folder on your desktop styled <strong className="text-zinc-300">"Gmail Task Bridge"</strong>.</li>
                  <li>Save the files below as <strong className="text-zinc-300">manifest.json</strong> and <strong className="text-zinc-300">content.js</strong> in that folder.</li>
                  <li>Open Chrome, navigate to <code className="text-pink-300 font-mono bg-pink-955 px-1 py-0.5 rounded text-[10.5px]">chrome://extensions</code>, and toggle <strong>Developer Mode</strong> (top-right).</li>
                  <li>Click <strong>Load unpacked</strong> and select your created folder!</li>
                </ol>
              </div>

              {/* Code blocks for Extension */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Manifest Block */}
                <div className="border border-zinc-800 rounded-2xl bg-zinc-950 overflow-hidden relative">
                  <div className="p-2.5 bg-zinc-900/50 border-b border-zinc-800/80 flex justify-between items-center text-[11px]">
                    <span className="font-mono text-zinc-300 font-bold">manifest.json</span>
                    <button
                      onClick={() => copyToClipboard(chromeManifest, 'manifest.json')}
                      className="p-1 hover:bg-zinc-750 text-zinc-400 hover:text-white rounded transition"
                      title="Copy Manifest file"
                    >
                      {copiedText === 'manifest.json' ? <Check className="w-3 text-emerald-400" /> : <Copy className="w-3" />}
                    </button>
                  </div>
                  <pre className="p-3 overflow-x-auto text-[10px] font-mono text-zinc-400 h-36 leading-tight whitespace-pre select-all">
                    {chromeManifest}
                  </pre>
                </div>

                {/* Content Script Block */}
                <div className="border border-zinc-800 rounded-2xl bg-zinc-950 overflow-hidden relative">
                  <div className="p-2.5 bg-zinc-900/50 border-b border-zinc-800/80 flex justify-between items-center text-[11px]">
                    <span className="font-mono text-zinc-300 font-bold">content.js</span>
                    <button
                      onClick={() => copyToClipboard(chromeContentScript, 'content.js')}
                      className="p-1 hover:bg-zinc-750 text-zinc-400 hover:text-white rounded transition"
                      title="Copy Content Script file"
                    >
                      {copiedText === 'content.js' ? <Check className="w-3 text-emerald-400" /> : <Copy className="w-3" />}
                    </button>
                  </div>
                  <pre className="p-3 overflow-x-auto text-[10px] font-mono text-zinc-400 h-36 leading-tight whitespace-pre select-all">
                    {chromeContentScript}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* Interactive Simulation Sandbox */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-zinc-950 via-zinc-900/85 to-zinc-950 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-indigo-400 animate-spin" style={{ animationDuration: '6s' }} />
                <span className="font-bold text-xs uppercase font-mono text-white tracking-wider">
                  Interactive Workspace Sandbox Simulator
                </span>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 bg-emerald-950/45 text-emerald-400 rounded border border-emerald-900/50 font-mono font-bold uppercase">
                TEST CONNECTION LIVE
              </span>
            </div>

            <p className="text-[11px] text-zinc-550 leading-relaxed">
              Test how the backend accepts programmatic Gmail triggers. Submit this form to simulate an incoming API call from Gmail directly into this active session!
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-zinc-500 font-bold">Virtual Gmail Title / Subject</label>
                <input
                  type="text"
                  value={simSubject}
                  onChange={(e) => setSimSubject(e.target.value)}
                  className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 text-xs text-white rounded font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-zinc-500 font-bold">Assignee Destination</label>
                <select
                  value={simAssignee}
                  onChange={(e) => setSimAssignee(e.target.value)}
                  className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 rounded font-mono focus:outline-none focus:border-indigo-500"
                >
                  {users.map((u) => (
                    <option key={u.email} value={u.email}>
                      {u.avatar} {u.name} ({u.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleSimulateClick}
                disabled={simRunning}
                className="px-4 py-2 bg-gradient-to-r from-red-600 via-indigo-600 to-pink-650 hover:from-red-700 hover:to-pink-700 active:scale-[0.98] disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 transition cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 text-white" />
                <span>{simRunning ? 'Executing Webhook API...' : 'Simulate Gmail Trigger Code (Push into App)'}</span>
              </button>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-900 text-center text-[10px] font-mono text-zinc-500">
          Zero-Trust Privacy Protocol • Dynamic Origin: {currentOrigin}
        </div>
      </div>
    </div>
  );
}
