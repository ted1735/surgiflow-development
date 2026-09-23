SPFx Conversion Golden Path

Reusable Markdown specification: SPFx_Conversion_Golden_Path_Specification.md

<style>
        :root {
        --accent: #464feb;
        --timeline-ln: linear-gradient(to bottom, transparent 0%, #b0beff 15%, #b0beff 85%, transparent 100%);
        --timeline-border: #ffffff;
        --bg-card: #f5f7fa;
        --bg-hover: #ebefff;
        --text-title: #424242;
        --text-accent: var(--accent);
        --text-sub: #424242;
        --radius: 12px;
        --border: #e0e0e0;
        --shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
        --hover-shadow: 0 4px 14px rgba(39, 16, 16, 0.1);
        --font: "Segoe Sans", "Segoe UI", "Segoe UI Web (West European)", -apple-system, "system-ui", Roboto, "Helvetica Neue", sans-serif;
        --overflow-wrap: break-word;
    }

    @media (prefers-color-scheme: dark) {
        :root {
            --accent: #7385ff;
            --timeline-ln: linear-gradient(to bottom, transparent 0%, transparent 3%, #6264a7 30%, #6264a7 50%, transparent 97%, transparent 100%);
            --timeline-border: #424242;
            --bg-card: #1a1a1a;
            --bg-hover: #2a2a2a;
            --text-title: #ffffff;
            --text-sub: #ffffff;
            --shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
            --hover-shadow: 0 4px 14px rgba(0, 0, 0, 0.5);
            --border: #3d3d3d;
        }
    }

    @media (prefers-contrast: more),
    (forced-colors: active) {
        :root {
            --accent: ActiveText;
            --timeline-ln: ActiveText;
            --timeline-border: Canvas;
            --bg-card: Canvas;
            --bg-hover: Canvas;
            --text-title: CanvasText;
            --text-sub: CanvasText;
            --shadow: 0 2px 10px Canvas;
            --hover-shadow: 0 4px 14px Canvas;
            --border: ButtonBorder;
        }
    }

    .insights-container {
        display: grid;
        grid-template-columns: repeat(2,minmax(240px,1fr));
        padding: 0px 16px 0px 16px;
        gap: 16px;
        margin: 0 0;
        font-family: var(--font);
    }

    .insight-card:last-child:nth-child(odd){
        grid-column: 1 / -1;
    }

    .insight-card {
        background-color: var(--bg-card);
        border-radius: var(--radius);
        border: 1px solid var(--border);
        box-shadow: var(--shadow);
        min-width: 220px;
        padding: 16px 20px 16px 20px;
    }

    .insight-card:hover {
        background-color: var(--bg-hover);
    }

    .insight-card h4 {
        margin: 0px 0px 8px 0px;
        font-size: 1.1rem;
        color: var(--text-accent);
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .insight-card .icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        font-size: 1.1rem;
        color: var(--text-accent);
    }

    .insight-card p {
        font-size: 0.92rem;
        color: var(--text-sub);
        line-height: 1.5;
        margin: 0px;
        overflow-wrap: var(--overflow-wrap);
    }

    .insight-card p b, .insight-card p strong {
        font-weight: 600;
    }

    .metrics-container {
        display:grid;
        grid-template-columns:repeat(2,minmax(210px,1fr));
        font-family: var(--font);
        padding: 0px 16px 0px 16px;
        gap: 16px;
    }

    .metric-card:last-child:nth-child(odd){
        grid-column:1 / -1; 
    }

    .metric-card {
        flex: 1 1 210px;
        padding: 16px;
        background-color: var(--bg-card);
        border-radius: var(--radius);
        border: 1px solid var(--border);
        text-align: center;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .metric-card:hover {
        background-color: var(--bg-hover);
    }

    .metric-card h4 {
        margin: 0px;
        font-size: 1rem;
        color: var(--text-title);
        font-weight: 600;
    }

    .metric-card .metric-card-value {
        margin: 0px;
        font-size: 1.4rem;
        font-weight: 600;
        color: var(--text-accent);
    }

    .metric-card p {
        font-size: 0.85rem;
        color: var(--text-sub);
        line-height: 1.45;
        margin: 0;
        overflow-wrap: var(--overflow-wrap);
    }

    .timeline-container {
        position: relative;
        margin: 0 0 0 0;
        padding: 0px 16px 0px 56px;
        list-style: none;
        font-family: var(--font);
        font-size: 0.9rem;
        color: var(--text-sub);
        line-height: 1.4;
    }

    .timeline-container::before {
        content: "";
        position: absolute;
        top: 0;
        left: calc(-40px + 56px);
        width: 2px;
        height: 100%;
        background: var(--timeline-ln);
    }

    .timeline-container > li {
        position: relative;
        margin-bottom: 16px;
        padding: 16px 20px 16px 20px;
        border-radius: var(--radius);
        background: var(--bg-card);
        border: 1px solid var(--border);
    }

    .timeline-container > li:last-child {
        margin-bottom: 0px;
    }

    .timeline-container > li:hover {
        background-color: var(--bg-hover);
    }

    .timeline-container > li::before {
        content: "";
        position: absolute;
        top: 18px;
        left: -40px;
        width: 14px;
        height: 14px;
        background: var(--accent);
        border: var(--timeline-border) 2px solid;
        border-radius: 50%;
        transform: translateX(-50%);
        box-shadow: 0px 0px 2px 0px #00000012, 0px 4px 8px 0px #00000014;
    }

    .timeline-container > li h4 {
        margin: 0 0 5px;
        font-size: 1rem;
        font-weight: 600;
        color: var(--accent);
    }

    .timeline-container > li h4 em {
        margin: 0 0 5px;
        font-size: 1rem;
        font-weight: 600;
        color: var(--accent);
        font-style: normal;
    }

    .timeline-container > li * {
        margin: 0;
        font-size: 0.9rem;
        color: var(--text-sub);
        line-height: 1.4;
    }

    .timeline-container > li * b, .timeline-container > li * strong {
        font-weight: 600;
    }
        @media (max-width:600px){
        .metrics-container,
        .insights-container{
            grid-template-columns:1fr;
      }
    }
</style>
<div class="insights-container">
 <div class="insight-card">
  <h4>Production baseline</h4>
  <p>SPFx 1.23.2, Node.js 22 LTS, React 17.0.1, TypeScript within the supported range, and the Heft toolchain.</p>
 </div>
 <div class="insight-card">
  <h4>Conversion strategy</h4>
  <p>Create a clean Microsoft scaffold and migrate application capabilities into it. Do not retrofit the original Vite, CRA, Next.js, or Node project in place.</p>
 </div>
 <div class="insight-card">
  <h4>Theme standard</h4>
  <p>Fluent UI v9 semantic tokens, scoped ThemeProvider integration, section variants, forced-colors support, and no hard-coded UI colors.</p>
 </div>
</div>

1. Current production baseline

As of September 2, 2026, the recommended production baseline is SPFx 1.23.2. Microsoft lists it with Node.js 22 LTS, React 17.0.1, and TypeScript 2.9–5.8 and warns that incompatible React versions can cause silent runtime failures. SPFx 1.24 remains a preview line; beta.3 was released August 27, 2026 and introduces React 18 for validation rather than current production deployment.(Source: Microsoft Learn)

Component	Golden-path standardSPFx	1.23.2 production
Node.js	22 LTS, exact approved 22.x in .nvmrc
React / React DOM	17.0.1 exact
TypeScript	Generator-selected version within supported range
Build	Heft, not a new Gulp implementation
UI	Fluent UI v9 for new application UI; retain v8 only for documented compatibility gaps
Styling	Griffel/makeStyles + tokens; CSS Modules for scoped layout
Package	.sppkg with includeClientSideAssets: true
Deployment	Approved site collection or tenant App Catalog
Preview policy	Never promote @next/preview packages to production

SPFx 1.22 introduced the Heft-based toolchain; current production commands consolidate build and bundling into heft build --production, followed by heft package-solution --production. Microsoft identifies Gulp as the legacy toolchain for older projects.(Source: Microsoft Learn)

Important Fluent UI nuance

Microsoft’s general SPFx integration page still notes that scaffolds use @fluentui/react v8.
Current Microsoft guidance for new React UI and property-pane controls encourages Fluent UI v9, design tokens, responsive layouts, and accessible host integration.
Therefore, the standard should be:
v9 for new user-interface components
v8 only where a required component has no acceptable v9 replacement
Never mix theme systems without one explicit bridge/provider boundary.(Source: Microsoft Learn)(Source: Microsoft Learn)
2. Target architecture

Every conversion produces two potential deployment units:

SPFx client package
React presentation and interaction
Safe client-side calculations
SharePoint/Graph delegated access
Theme and section-background integration
No secrets or Node server behavior
External API, only when needed
Node runtime
Database and filesystem access
Integrations requiring secrets
Scheduled/background processing
Application permissions or privileged operations
Server-side authorization and audit logging

SPFx runs in the browser and cannot safely store secrets. Microsoft recommends AadHttpClient for Entra ID-secured resources; SPFx permission requests are declared in the solution package and approved administratively.(Source: Microsoft Learn)

Figure 1: Golden-path conversion architecture: source applications are decomposed into a browser-safe SPFx client and, when needed, a separately hosted Entra ID-secured API, then gated through build, App Catalog deployment, and tenant validation.

Required component boundaries
<Name>WebPart.ts
├── WebPartContext
├── ThemeBridge
├── ConfigurationResolver
├── ClientFactory
└── AppShell
    ├── Feature components
    ├── Domain models and validators
    ├── SharePointClient
    ├── GraphClient
    └── SecureApiClient


Web part host responsibilities

Acquire SPFx context and scoped theme.
Handle theme, display-mode, and width changes.
Resolve validated non-secret configuration.
Create data clients.
Render and unmount React.
Remove event handlers, observers, and subscriptions.

React application responsibilities

Presentation and interaction.
Domain rules.
Loading, empty, retry, conflict, and permission states.
Accessible forms and navigation.
No direct dependency on global SharePoint page markup.
3. Non-negotiable engineering rules

Fresh scaffold, selective migration

Scaffold using the current Microsoft generator.
Commit the untouched scaffold.
Move models, services, and components by responsibility.
Do not copy old Webpack, Vite, CRA, Next.js, Express, or package configuration wholesale.

One supported dependency matrix

Pin SPFx packages consistently.
Pin React and React DOM to 17.0.1.
Commit one package-lock.json.
Use npm ci in automation.

Zero server behavior in SPFx

Reject Express listeners, SQLite drivers, fs, net, tls, child processes, private keys, client secrets, and webhook signing secrets.
Browser polyfills do not convert server libraries into safe client libraries.

No global page ownership

No document.body styling.
No generic global IDs.
No global CSS resets.
No assumption that the app owns the viewport or URL router.
Multiple instances must coexist on one page.

Semantic theming

No bg-white, text-slate-*, fixed gray borders, or fixed light-only shadows.
Brand colors may be fixed only when legally required and still must pass contrast validation.

Stop at failed gates

Building successfully is not sufficient.
No stage advances with unresolved red dependencies, missing assets, console exceptions, unauthorized APIs, or failed theme/accessibility checks.
4. Architecture-assessment gate
Inputs
Working source repository and commit
Dependency tree
Route inventory
API/endpoints inventory
Environment variables
Screenshots of critical workflows
Browser-console and network baseline
Supported browser/device list
Assessment checklist
Area	Reject or adapt when…Entry point	App requires ownership of #root
Routing	BrowserRouter depends on server-side fallback routes
DOM	Uses document.body, broad querySelector, global IDs, or unmanaged portals
CSS	Uses resets, Tailwind preflight, html/body/*, global Bootstrap, excessive !important
Layout	Assumes full viewport or fixed desktop width
Assets	Uses /assets/..., filesystem paths, dynamic string imports, or case-inconsistent names
Environment	Relies on runtime process.env inside the browser
Authentication	Implements independent MSAL flow or stores API keys
State	Uses global singleton state shared across web-part instances
Storage	Treats localStorage as shared or authoritative data
APIs	Requires a CORS-incompatible endpoint
Dependencies	Requires Node runtime, React 18+, unsupported globals, or incompatible ESM/CJS
Lifecycle	Leaves timers, listeners, subscriptions, workers, or object URLs active after disposal
Errors	Throws blank-page failures with no error boundary
Pass criteria
Two web-part instances render independently on the same page.
Unmounting one instance leaves no active listener, timer, portal, or subscription.
Navigation does not modify SharePoint’s route unexpectedly.
All environment assumptions are documented.
Every source feature is classified as client, server, replace, or remove.
5. Node/API-backed application standard
Capability	SPFx client	External serverReact UI	Yes	No
SharePoint access as current user	Yes	Optional
Graph delegated call	Yes	Optional
Server secret/API key	Never	Yes
SQLite/database driver	Never	Yes
Background job	Never	Yes
Application permission	Never	Approved server identity
UX validation	Yes	Yes
Authoritative validation	No	Yes
Authorization enforcement	No	Yes
Secure API pattern
Register the server API in Entra ID.
Expose a least-privilege delegated scope such as access_as_user.
Declare it in config/package-solution.json.
Obtain the client through context.aadHttpClientFactory.
Validate tokens and business authorization in the server.
Restrict CORS to exact approved SharePoint origins.
Store secrets only in the server’s approved secure store.
Return correlation IDs; do not expose sensitive stacks or payloads.
"webApiPermissionRequests": [
  {
    "resource": "SurgiFlow API",
    "scope": "access_as_user"
  }
]

const client = await context.aadHttpClientFactory.getClient(
  config.apiResourceUri
);

const response = await client.get(
  `${config.apiBaseUrl}/patients`,
  AadHttpClient.configurations.v1
);

if (!response.ok) {
  throw await ApiError.fromResponse(response);
}


API grants apply tenant-wide through the SharePoint Online Client Extensibility service principal, and deploying the package does not prove that requested permissions were approved. The application must detect and display a permission-not-approved state.(Source: Microsoft Learn)

6. Dependency decision tree

For every direct and significant transitive package:

Requires Node built-ins or server behavior?
Move server-side or replace.
React peer dependency accepts 17.0.1?
If no, pin a compatible release or replace.
Injects global CSS/reset styles?
Reject or completely scope beneath the web-part root.
Builds under Heft production Webpack?
If not, inspect ESM/CJS exports; do not add random Webpack overrides.
Uses dynamic non-literal imports?
Refactor to literal imports and test deployed chunk URLs.
Requires eval, inline script, mutable globals, or unsupported browser APIs?
Reject absent an approved supported design.
Duplicates React, Fluent UI, icons, utilities, or date libraries?
Consolidate and use selective imports.
Maintained, licensed, and security-reviewed?
Otherwise replace or document an approved exception.
npm ci
npm ls react react-dom
npm explain <package-name>
npm outdated
npm audit --omit=dev


Do not run npm audit fix --force against SPFx. Review runtime reachability and use a supported SPFx/package upgrade. Microsoft warns that manually updating only package.json across SPFx releases can create build failures.(Source: Microsoft Learn)

7. Theming contract

SharePoint supports None, Neutral, Soft, and Strong section backgrounds across light and dark themes. Semantic slots change according to the active variant—for example, body text can switch to white on a Strong section. supportsThemeVariants and the scoped ThemeProvider are therefore mandatory.(Source: Microsoft Learn)(Source: Microsoft Learn)

Manifest
{
  "supportsThemeVariants": true,
  "requiresCustomScript": false,
  "manifestVersion": 2
}

Recommended v9 host bridge
import {
  ThemeProvider,
  ThemeChangedEventArgs
} from '@microsoft/sp-component-base';

import {
  FluentProvider,
  Theme,
  webLightTheme
} from '@fluentui/react-components';

import { createV9Theme } from '@fluentui/react-migration-v8-v9';

private themeProvider!: ThemeProvider;
private themeV9: Theme = webLightTheme;

protected async onInit(): Promise<void> {
  this.themeProvider =
    this.context.serviceScope.consume(ThemeProvider.serviceKey);

  this.themeProvider.themeChangedEvent.add(
    this,
    this.onThemeChangedEvent
  );

  this.applyTheme();
  return super.onInit();
}

private onThemeChangedEvent =
  (_sender: unknown, args: ThemeChangedEventArgs): void => {
    this.applyTheme(args);
    this.render();
  };

private applyTheme(args?: ThemeChangedEventArgs): void {
  const v9 =
    args?.themeV2 ?? this.themeProvider.tryGetThemeV2();

  const v8 =
    args?.theme ?? this.themeProvider.tryGetTheme();

  this.themeV9 =
    v9 ?? createV9Theme(v8 as never, webLightTheme);
}


ThemeProvider exposes tryGetThemeV2() and theme-change events containing Fluent v9 theme data. The newer PnP Fluent UI 9 sample demonstrates FluentProvider, createV9Theme, and theme-change handling, but remains a community example rather than Microsoft support policy.(Source: Microsoft Learn)

Component styling
import { makeStyles, tokens } from '@fluentui/react-components';

const useStyles = makeStyles({
  root: {
    color: tokens.colorNeutralForeground1,
    backgroundColor: tokens.colorNeutralBackground1
  },
  card: {
    backgroundColor: tokens.colorNeutralBackground2,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    boxShadow: tokens.shadow4
  },
  error: {
    color: tokens.colorPaletteRedForeground1
  }
});

High contrast
@media (forced-colors: active) {
  .surface {
    color: CanvasText;
    background: Canvas;
    border-color: CanvasText;
  }

  .focusable:focus-visible {
    outline: 2px solid Highlight;
    outline-offset: 2px;
  }

  .link {
    color: LinkText;
  }
}

Required visual test matrix
Theme	None	Neutral	Soft	StrongLight	Pass	Pass	Pass	Pass
Dark	Pass	Pass	Pass	Pass
Forced colors	colspan	All critical workflows		

Validate text, links, icons, borders, focus, selected/disabled states, dialogs, toasts, charts, SVGs, images, hover states, and error/success/warning indicators.

8. Configuration standard

Resolution order

Safe code default
Approved site/tenant configuration
Property-pane override when appropriate
Schema validation
Fail closed with an admin-readable message
Value	Local	UAT	ProductionSite/list IDs	Dev config	UAT config	Production config
API URI	Local HTTPS/dev API	UAT API	Production API
Feature flags	Local defaults	Remote non-secret flags	Controlled non-secret flags
Secrets	Server developer store	Server secure store	Server secure store
Permissions	Dev tenant	UAT approval	Production least privilege

Never place secrets in

JavaScript or source maps
Property-pane values
SharePoint Lists
Tenant properties
Manifests
Environment variables compiled into the bundle
Power Automate callback URLs containing embedded signatures
9. Mechanical conversion algorithm
#	Stage	Output	Stop condition0	Freeze source and capture baseline	Tagged reproducible app	Unknown dependency/API
1	Classify client/server/replace/remove	Target architecture	Server behavior remains in client
2	Dependency audit	Approved package plan	Any unresolved red package
3	Fresh SPFx scaffold	Untouched working host	Scaffold production build fails
4	Theme host	Variant-aware FluentProvider	Eight theme cells fail
5	Migrate pure domain code	Tested models/functions	Unit failures
6	Migrate one read-only screen	Scoped React shell	Global DOM/CSS collision
7	Add data adapters	Typed SharePoint/Graph/API layer	Auth/error matrix fails
8	Migrate write workflow	Concurrency-safe transaction	Data loss/conflict failure
9	Complete responsive/accessibility work	Test evidence	Critical accessibility issue
10	Clean build/package	Valid .sppkg	Warning, secret, bad URL, missing module
11	Deploy to UAT catalog	Enabled package	Package or consent failure
12	Tenant smoke test	Signed validation	Unexpected console/network error
13	Promote same artifact	Production release	Artifact hash differs
10. Build and App Catalog pipeline
heft clean
npm ci
npm test
heft build --production
heft package-solution --production


Before upload, inspect the package for:

webpackMissingModule
localhost
placeholder URLs
embedded secrets or signed webhook URLs
unexpected source maps
missing images/fonts
duplicate React
incorrect solution/component GUIDs
unchanged package version
excessive permissions

Microsoft’s deployment flow uploads the generated .sppkg, enables the app, reports validation failures through the App Package Error Message column, and hosts included client assets through Microsoft 365 CDN or the App Catalog.(Source: Microsoft Learn)

Catalog scope
Tenant App Catalog: package can be made available across site collections.
Site collection App Catalog: package remains scoped to that site collection.
Included client assets are supported in site catalogs.
Do not confuse client assets with Feature Framework provisioning of fields, content types, and lists, which has separate limitations.
Upgrade and rollback
Increment the four-part solution version for every replacement.
Keep solution and component GUIDs stable.
Record commit, package hash, lockfile hash, permissions, and test evidence.
Preserve the former source tag.
Roll back by rebuilding prior code with a new higher package version and repeating smoke tests.
11. Automated quality gate
Check	Automated	ManualNode/SPFx/React compatibility	Yes	Exception review
npm ci and lockfile integrity	Yes	No
TypeScript, ESLint, unit tests	Yes	No
Duplicate React/dependency scan	Yes	Review
Node-built-in denylist	Yes	False-positive review
Hard-coded color/global CSS scan	Yes	Visual audit
Production package scan	Yes	Metadata review
axe accessibility	Yes	Keyboard/screen reader
Responsive screenshot matrix	Yes	Touch/edit-mode review
Light/dark/section variants	Partly	Required
API response matrix	Yes	Production consent
Console/network failures	Yes via E2E	DevTools confirmation
Upgrade/rollback	Partly	Catalog confirmation

Automated accessibility tools cannot detect every interactive barrier. Microsoft recommends keyboard, narrow-window, zoom, screen-reader, and high-contrast testing in addition to automated reports.(Source: Microsoft Learn)(Source: Microsoft Learn)

12. Troubleshooting matrix
Symptom	Diagnostic	Corrective actionBlank web part	First console exception and failed network item	Fix first causal error; verify package asset
Missing module	Production build and emitted bundle	Correct file case/path/import
Invalid hook call	npm ls react react-dom	Pin one React 17.0.1 tree
Local works, tenant fails	Search package for localhost; check Network	Externalize config; approve permissions; correct CORS
Dark mode unreadable	Inspect computed token/provider root	Replace hard-coded color with semantic token
Strong section mismatch	Check manifest and scoped theme	Enable variants and use scoped ThemeProvider
Dialog not themed	Inspect portal location	Keep portal below FluentProvider
401	Audience/token acquisition	Correct resource URI and AadHttpClient
403	Grant and server authorization logs	Approve scope or correct authorization
CORS/preflight	OPTIONS headers/origin	Exact origin and required methods/headers
Asset 404	Package contents and deployed URL	Static import or approved absolute URL
Package invalid	App Package Error Message	Fix manifest/version/path and rebuild cleanly
Upgrade regression	Compare lockfile/config/package	Revert slice or forward-version rollback
13. Immediate SurgiFlow relevance

The current internal sf-RCC-SPFXV6.1-2026.8.26.0916.zip contains a generated missing-module failure for ./assets/surgiflow-landscape-logo.svg. Its bundle also contains global browser assumptions, local storage, a relative /api/send-power-automate call, and substantial hard-coded Tailwind color usage—the exact classes of defects this gate model is designed to catch before App Catalog upload.

Recommended first remediation order

Fix the SVG as a source-controlled static import.
Add an automated package scan for webpackMissingModule.
Move SQLite, /api/send-power-automate, arbitrary forwarding, and server-only routes outside SPFx.
Replace local/default endpoints with validated configuration.
Replace hard-coded color utilities with Fluent semantic tokens.
Add the eight-cell theme/section test matrix.
Perform one clean Heft build before any new .sppkg upload.
14. Definition of done
 Current Microsoft compatibility matrix recorded.
 Production SPFx—not preview—is used.
 Node, React, React DOM, TypeScript, and Fluent dependencies are compatible and pinned.
 No server runtime, secret, app-only credential, or privileged authorization exists in SPFx.
 Two web-part instances coexist and dispose cleanly.
 supportsThemeVariants: true.
 One root FluentProvider receives the scoped live theme.
 Light/dark × None/Neutral/Soft/Strong passes.
 High contrast, keyboard, screen reader, zoom, reflow, and focus pass.
 API validates token and business authorization server-side.
 2xx, empty, 401, 403, conflict, throttle, 5xx, timeout, and offline states pass.
 Clean npm ci and Heft production build pass.
 .sppkg contains no missing modules, secrets, localhost, or unapproved endpoints.
 App Catalog reports a valid package with no package error.
 Required API consent is verified—not assumed.
 Same package artifact is promoted.
 Release evidence and forward-version rollback package are available.
 Post-deployment console, network, theme, API, and responsive smoke tests pass.

Final rule: “It builds” is not done. Done means every gate passes before promotion.
