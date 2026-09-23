# SurgiFlow Huddle Workspace Deployment

## Purpose

The Huddle Workspace is a SharePoint **Single Part App Page** containing one SurgiFlow web part. SharePoint locks its page layout, so normal SharePoint content columns cannot constrain the app.

## Create the locked page

1. Open the SurgiFlow site and select **New** > **Page**.
2. Select the **Single Part App Page** layout.
3. Enter the title **SurgiFlow Huddle Workspace**. Keep the page name `SurgiFlow-Huddle-Workspace`.
4. In the single app picker, select **SurgiFlow COIP Clinical Intelligence Hub**.
5. Select **Publish**.
6. Copy the published page URL. It should normally be `https://ahsonline.sharepoint.com/teams/SurgiFlow/SitePages/SurgiFlow-Huddle-Workspace.aspx`.

## Connect the launcher

1. Open any normal page that already contains the SurgiFlow web part.
2. Select **Edit** > select the SurgiFlow web part > select **Edit web part**.
3. Set **Huddle Workspace page URL** to the published page URL from above.
4. Republish the normal page.
5. Select **Launch Huddle Workspace**. It opens the locked page in a new tab.

## Verify

- The Huddle page contains only SurgiFlow and cannot be edited by end users.
- The launcher opens a new tab, not a nested browser popup.
- On the Huddle page, the dashboard and header use the available full-page width.
- The patient summary remains an in-app React modal, so it continues to work inside the full-page workspace.

## Notes

- `SharePointFullPage` is already listed in `SurgiflowWebPart.manifest.json`, which makes SurgiFlow selectable for a Single Part App Page.
- The default launcher path is `/SitePages/SurgiFlow-Huddle-Workspace.aspx`; configure the exact published URL if your page has a different name.
