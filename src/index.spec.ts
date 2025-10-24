import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { asyncForEach } from '@wojtekmaj/async-array-utils';
import pThrottle from 'p-throttle';
import { z } from 'zod';

import * as jotform from './index.js';

const TEST_FORM_ID = '232143945675058';

const TEST_FORM_SUBMISSION_ID = '5747651132391058779';

const TEST_FORM_QUESTION_ID = '1';

const TEST_ROOT_LABEL_ID = '0198c14737e87f33877e374156563c7be95a';
const TEST_LABEL_ID = '019a15aba90c7fc2a2f9b95959c72c8345cc';
const TEST_SUBLABEL_ID = '019a15b168537cd0bec4853947b190efb857';

const TEST_ROOT_FOLDER_ID = '64cba4746334320c7cd86aa0';
const TEST_FOLDER_ID = '64cba4746334320c7c37f6b1';
const TEST_SUBFOLDER_ID = '64cba47f366166d6c6b373a8';


const TEST_REPORT_ID = '232152641243042';

// Throttle fetch API calls to avoid rate limiting
const throttle = pThrottle({ limit: 1, interval: 1000 });

vi.stubGlobal('fetch', throttle(fetch));

describe('index', () => {
  it('has options exported properly', () => {
    expect(jotform.options).toBeDefined();
  });
});

/**
 * General
 */

// API call takes ~12 seconds to complete, we can't wait this long
describe.skip('getHistory()', () => {
  it('returns history data properly', async () => {
    const response = await jotform.getHistory();

    expect(response).toMatchObject(expect.any(Array));
  });
});

describe('getSettings()', () => {
  it('returns settings data properly', async () => {
    const response = await jotform.getSettings();

    expect(response).toMatchObject({
      email: expect.any(String),
    });
  });
});

describe('updateSettings()', () => {
  it('updates settings properly', async () => {
    const response = await jotform.updateSettings({
      website: 'https://example.com',
    });

    expect(response).toMatchObject({
      website: 'https://example.com',
    });
  });
});

// Getting "User is not Allowed" error
describe.skip('getSubusers()', () => {
  it('returns subusers data properly', async () => {
    const response = await jotform.getSubusers();

    expect(response).toMatchObject(expect.any(Array));
  });
});

describe('getUsage()', () => {
  it('returns usage data properly', async () => {
    const response = await jotform.getUsage();

    expect(response).toMatchObject({
      api: expect.any(Number),
    });
  });
});

describe('getUser()', () => {
  it('returns user data properly', async () => {
    const response = await jotform.getUser();

    expect(response).toMatchObject({
      email: expect.any(String),
    });
  });
});

describe('getPlan()', () => {
  it('returns plan data properly', async () => {
    const response = await jotform.getPlan('FREE');

    expect(response).toMatchObject({
      name: 'FREE',
    });
  });
});

/**
 * Forms
 */

describe('getForms()', () => {
  it('returns forms data properly', async () => {
    const response = await jotform.getForms({ filter: { status: 'ENABLED' } });

    expect(response).toMatchObject(expect.any(Array));

    const anyResponse = z.any().parse(response);

    const testForm = anyResponse.find((form: { id: string }) => form.id === TEST_FORM_ID);

    expect(testForm).toBeDefined();
  });
});

describe('getForm()', () => {
  it('returns form data properly', async () => {
    const response = await jotform.getForm(TEST_FORM_ID);

    expect(response).toMatchObject({
      id: TEST_FORM_ID,
    });
  });
});

describe('createForm()', () => {
  const createdFormIds: string[] = [];

  afterAll(async () => {
    await asyncForEach(createdFormIds, async (formId) => {
      await jotform.deleteForm(formId);
    });
  });

  it('creates form properly', async () => {
    const response = await jotform.createForm({ questions: [] });

    expect(response).toMatchObject({
      id: expect.any(String),
    });

    const anyResponse = z.any().parse(response);

    // Store form ID for later use
    createdFormIds.push(anyResponse.id);
  });
});

describe('createForms()', () => {
  const createdFormIds: string[] = [];

  afterAll(async () => {
    await asyncForEach(createdFormIds, async (formId) => {
      await jotform.deleteForm(formId);
    });
  });

  it('creates forms properly', async () => {
    const response = await jotform.createForms([{ title: 'Test form', questions: [] }]);

    // Not a mistake, actual unexpected API response
    expect(response).toMatchObject({
      id: expect.any(String),
    });

    const anyResponse = z.any().parse(response);

    // Store form ID for later use
    createdFormIds.push(anyResponse.id);
  });
});

describe('deleteForm()', () => {
  let createdFormId: string;

  beforeAll(async () => {
    const response = await jotform.createForm({ questions: [] });

    const anyResponse = z.any().parse(response);

    createdFormId = anyResponse.id;
  });

  it('deletes form properly', async () => {
    const response = await jotform.deleteForm(createdFormId);

    expect(response).toMatchObject({
      id: createdFormId,
    });
  });
});

describe('cloneForm()', () => {
  const createdFormIds: string[] = [];

  afterAll(async () => {
    await asyncForEach(createdFormIds, async (formId) => {
      await jotform.deleteForm(formId);
    });
  });

  it('clones form properly', async () => {
    const response = await jotform.cloneForm(TEST_FORM_ID);

    expect(response).toMatchObject({
      id: expect.any(String),
    });

    const anyResponse = z.any().parse(response);

    // Store form ID for later use
    createdFormIds.push(anyResponse.id);
  });
});

/**
 * Form files
 */

describe('getFormFiles()', () => {
  it('returns form files data properly', async () => {
    const response = await jotform.getFormFiles(TEST_FORM_ID);

    expect(response).toMatchObject(expect.any(Array));
  });
});

/**
 * Form properties
 */

describe('getFormProperties()', () => {
  it('returns form properties data properly', async () => {
    const response = await jotform.getFormProperties(TEST_FORM_ID);

    expect(response).toMatchObject(expect.any(Object));
  });
});

describe('getFormProperty()', () => {
  it('returns form property data properly', async () => {
    const response = await jotform.getFormProperty(TEST_FORM_ID, 'pagetitle');

    expect(response).toMatchObject({
      pagetitle: expect.any(String),
    });
  });
});

describe('addFormProperty()', () => {
  afterAll(async () => {
    await jotform.addFormProperty(TEST_FORM_ID, { properties: { pagetitle: 'Test form' } });
  });

  it('adds form property properly', async () => {
    const randomString = Math.random().toString(36).substring(7);

    const response = await jotform.addFormProperty(TEST_FORM_ID, {
      properties: { pagetitle: randomString },
    });

    expect(response).toMatchObject({
      pagetitle: randomString,
      formID: TEST_FORM_ID,
    });
  });
});

describe('addFormProperties()', () => {
  afterAll(async () => {
    await jotform.addFormProperties(TEST_FORM_ID, { properties: { pagetitle: 'Test form' } });
  });

  it('adds form property properly', async () => {
    const randomString = Math.random().toString(36).substring(7);

    const response = await jotform.addFormProperties(TEST_FORM_ID, {
      properties: { pagetitle: randomString },
    });

    expect(response).toMatchObject({
      pagetitle: randomString,
      formID: TEST_FORM_ID,
    });
  });
});

/**
 * Form questions
 */

describe('getFormQuestions()', () => {
  it('returns form questions data properly', async () => {
    const response = await jotform.getFormQuestions(TEST_FORM_ID);

    expect(response).toMatchObject(expect.any(Object));
  });
});

describe('getFormQuestion()', () => {
  it('returns form question data properly', async () => {
    const response = await jotform.getFormQuestion(TEST_FORM_ID, TEST_FORM_QUESTION_ID);

    expect(response).toMatchObject(expect.any(Object));
  });
});

describe('addFormQuestion()', () => {
  const createdQuestionIds: string[] = [];

  afterAll(async () => {
    await asyncForEach(createdQuestionIds, async (questionId) => {
      await jotform.deleteFormQuestion(TEST_FORM_ID, questionId);
    });
  });

  it('adds form question properly', async () => {
    const response = await jotform.addFormQuestion(TEST_FORM_ID, {
      question: {
        type: 'control_head',
      },
    });

    expect(response).toMatchObject({
      qid: expect.any(Number),
    });

    const anyResponse = z.any().parse(response);

    // Store question ID for later use
    createdQuestionIds.push(anyResponse.qid.toString());
  });
});

describe('addFormQuestions()', () => {
  const createdQuestionIds: string[] = [];

  afterAll(async () => {
    await asyncForEach(createdQuestionIds, async (questionId) => {
      await jotform.deleteFormQuestion(TEST_FORM_ID, questionId);
    });
  });

  it('adds form questions properly', async () => {
    const response = await jotform.addFormQuestions(TEST_FORM_ID, {
      questions: [
        {
          type: 'control_head',
        },
      ],
    });

    expect(response).toMatchObject(expect.any(Array));

    const anyResponse = z.any().parse(response);

    const item = anyResponse[0];

    expect(item).toMatchObject({
      qid: expect.any(Number),
    });

    // Store question ID for later use
    createdQuestionIds.push(item.qid.toString());
  });
});

describe('updateFormQuestion()', () => {
  let createdQuestionId: string;

  beforeAll(async () => {
    const response = await jotform.addFormQuestion(TEST_FORM_ID, {
      question: {
        type: 'control_textbox',
        text: 'Test question',
      },
    });

    const anyResponse = z.any().parse(response);

    createdQuestionId = anyResponse.qid.toString();
  });

  it('updates form question properly', async () => {
    const response = await jotform.updateFormQuestion(TEST_FORM_ID, createdQuestionId, {
      question: {
        hidden: 'Yes',
      },
    });

    expect(response).toMatchObject(expect.any(Array));

    const anyResponse = z.any().parse(response);

    const item = anyResponse[0];

    expect(item).toMatchObject({
      hidden: 'Yes',
    });
  });
});

describe('deleteFormQuestion()', () => {
  let createdQuestionId: string;

  beforeAll(async () => {
    const response = await jotform.addFormQuestion(TEST_FORM_ID, {
      question: {
        type: 'control_head',
      },
    });

    const anyResponse = z.any().parse(response);

    createdQuestionId = anyResponse.qid.toString();
  });

  it('deletes form question properly', async () => {
    const response = await jotform.deleteFormQuestion(TEST_FORM_ID, createdQuestionId);

    expect(response).toBe(`QuestionID #${createdQuestionId} successfully deleted.`);
  });
});

/**
 * Form reports
 */

describe('getFormReports()', () => {
  it('returns form reports data properly', async () => {
    const response = await jotform.getFormReports(TEST_FORM_ID);

    expect(response).toMatchObject(expect.any(Array));
  });
});

describe('getFormReport()', () => {
  it('returns submission data properly', async () => {
    const response = await jotform.getFormReport(TEST_FORM_ID, TEST_REPORT_ID);

    expect(response).toMatchObject({
      id: TEST_REPORT_ID,
    });
  });
});

describe('createFormReport()', () => {
  const createdReportIds: string[] = [];

  afterAll(async () => {
    await asyncForEach(createdReportIds, async (reportId) => {
      await jotform.deleteReport(reportId);
    });
  });

  it('creates form report properly', async () => {
    const response = await jotform.createFormReport(TEST_FORM_ID, {
      title: 'Test report',
      list_type: 'grid',
      fields: 'ip,dt,1',
    });

    expect(response).toMatchObject({
      id: expect.any(String),
    });

    const anyResponse = z.any().parse(response);

    // Store report ID for later use
    createdReportIds.push(anyResponse.id);
  });
});

describe('deleteFormReport()', () => {
  let createdReportId: string;

  beforeAll(async () => {
    const response = await jotform.createFormReport(TEST_FORM_ID, {
      title: 'Test report',
      list_type: 'grid',
      fields: 'ip,dt,1',
    });

    const anyResponse = z.any().parse(response);

    createdReportId = anyResponse.id;
  });

  it('deletes form report properly', async () => {
    const response = await jotform.deleteFormReport(TEST_FORM_ID, createdReportId);

    expect(response).toBe(true);
  });
});

/**
 * Form submissions
 */

describe('getFormSubmissions()', () => {
  it('returns submissions data properly', async () => {
    const response = await jotform.getFormSubmissions(TEST_FORM_ID, {
      filter: {
        status: 'ACTIVE',
      },
    });

    expect(response).toMatchObject(expect.any(Array));

    const anyResponse = z.any().parse(response);

    const testFormSubmission = anyResponse.find(
      (submission: { id: string }) => submission.id === TEST_FORM_SUBMISSION_ID,
    );

    expect(testFormSubmission).toBeDefined();
  });
});

describe('getFormSubmission()', () => {
  it('returns submission data properly', async () => {
    const response = await jotform.getFormSubmission(TEST_FORM_ID, TEST_FORM_SUBMISSION_ID);

    expect(response).toMatchObject({
      id: TEST_FORM_SUBMISSION_ID,
    });
  });
});

describe('createFormSubmission()', () => {
  const createdSubmissionIds: string[] = [];

  afterAll(async () => {
    await asyncForEach(createdSubmissionIds, async (submissionId) => {
      await jotform.deleteSubmission(submissionId);
    });
  });

  it('creates form submission properly', async () => {
    const response = await jotform.createFormSubmission(TEST_FORM_ID, {
      submission: {
        1: 'Test value',
      },
    });

    expect(response).toMatchObject({
      submissionID: expect.any(String),
    });

    const anyResponse = z.any().parse(response);

    // Store submission ID for later use
    createdSubmissionIds.push(anyResponse.submissionID);
  });
});

describe('createFormSubmissions()', () => {
  const createdSubmissionIds: string[] = [];

  afterAll(async () => {
    await asyncForEach(createdSubmissionIds, async (submissionId) => {
      await jotform.deleteSubmission(submissionId);
    });
  });

  it('creates form submissions properly', async () => {
    const response = await jotform.createFormSubmissions(TEST_FORM_ID, [
      {
        submission: {
          1: 'Test value',
        },
      },
    ]);

    expect(response).toMatchObject(expect.any(Array));

    const anyResponse = z.any().parse(response);

    const item = anyResponse[0];

    expect(item).toMatchObject({
      submissionID: expect.any(String),
    });

    // Store submission ID for later use
    createdSubmissionIds.push(item.submissionID);
  });
});

describe('deleteFormSubmission()', () => {
  let createdSubmissionId: string;

  beforeAll(async () => {
    const response = await jotform.createFormSubmission(TEST_FORM_ID, {
      submission: {
        1: 'Test value',
      },
    });

    const anyResponse = z.any().parse(response);

    createdSubmissionId = anyResponse.submissionID;
  });

  it('deletes form submission properly', async () => {
    const response = await jotform.deleteFormSubmission(TEST_FORM_ID, createdSubmissionId);

    expect(response).toBe(`Submission #${createdSubmissionId} deleted successfully.`);
  });
});

/**
 * Form webhooks
 */

describe('getFormWebhooks()', () => {
  it('returns webhooks data properly', async () => {
    const response = await jotform.getFormWebhooks(TEST_FORM_ID);

    expect(response).toMatchObject({});
  });
});

describe('createFormWebhook()', () => {
  const createdWebhookIds: string[] = [];

  afterAll(async () => {
    await asyncForEach(createdWebhookIds, async (webhookId) => {
      await jotform.deleteFormWebhook(TEST_FORM_ID, webhookId);
    });
  });

  it('creates webhook properly', async () => {
    const webhookUrl = `http://example.com/${Math.random().toString(36).substring(7)}`;

    const response = await jotform.createFormWebhook(TEST_FORM_ID, webhookUrl);

    expect(response).toMatchObject({
      '0': expect.any(String),
    });

    const anyResponse = z.any().parse(response);

    const [webhookId] = Object.entries(anyResponse).find(([, url]) => url === webhookUrl) as [
      string,
      string,
    ];

    // Store folder ID for later use
    createdWebhookIds.push(webhookId);
  });
});

describe('deleteFormWebhook()', () => {
  let createdWebhookId: string;

  beforeAll(async () => {
    const webhookUrl = `http://example.com/${Math.random().toString(36).substring(7)}`;

    const response = await jotform.createFormWebhook(TEST_FORM_ID, webhookUrl);

    const anyResponse = z.any().parse(response);

    const [webhookId] = Object.entries(anyResponse).find(([, url]) => url === webhookUrl) as [
      string,
      string,
    ];

    createdWebhookId = webhookId;
  });

  it('deletes webhook properly', async () => {
    const response = await jotform.deleteFormWebhook(TEST_FORM_ID, createdWebhookId);

    expect(response).toMatchObject({});
  });
});

/**
 * Labels
 */

describe('getLabels()', () => {
  it('returns labels data properly', async () => {
    const response = await jotform.getLabels();

    expect(response).toMatchObject({
      id: TEST_ROOT_LABEL_ID,
      sublabels: expect.any(Array),
    });

    const anyResponse = z.any().parse(response);

    const testLabel = anyResponse.sublabels.find(
      (label: { id: string }) => label.id === TEST_LABEL_ID,
    );

    expect(testLabel).toBeDefined();

    expect(testLabel).toEqual(
      expect.objectContaining({
        id: TEST_LABEL_ID,
        sublabels: expect.any(Array),
      }),
    );

    const testSublabel = testLabel.sublabels.find(
      (sublabel: { id: string }) => sublabel.id === TEST_SUBLABEL_ID,
    );

    expect(testSublabel).toBeDefined();

    expect(testSublabel).toEqual(
      expect.objectContaining({
        id: TEST_SUBLABEL_ID,
        sublabels: expect.any(Array),
      }),
    );
  });
});

describe('getLabel()', () => {
  let createdLabelId: string;

  beforeAll(async () => {
    const response = await jotform.createLabel({ name: 'Test label', color: '#FFFFFF' });

    const anyResponse = z.any().parse(response);

    createdLabelId = anyResponse.id;
  });

  afterAll(async () => {
    await jotform.deleteLabel(createdLabelId);
  });

  it('returns label data properly', async () => {
    const response = await jotform.getLabel(createdLabelId);

    expect(response).toMatchObject({
      id: createdLabelId,
      name: expect.any(String),
    });
  });
});

describe('createLabel()', () => {
  const createdLabelIds: string[] = [];

  afterAll(async () => {
    await asyncForEach(createdLabelIds, async (labelId) => {
      await jotform.deleteLabel(labelId);
    });
  });

  it('creates label properly', async () => {
    const response = await jotform.createLabel({ name: 'Another test label', color: '#DDDDDD' });

    expect(response).toMatchObject({
      id: expect.any(String),
    });

    const anyResponse = z.any().parse(response);

    createdLabelIds.push(anyResponse.id);
  });
});

describe('updateLabel()', () => {
  let createdLabelId: string;

  beforeAll(async () => {
    const response = await jotform.createLabel({ name: 'Updatable label', color: '#ABCDEF' });

    const anyResponse = z.any().parse(response);

    createdLabelId = anyResponse.id;
  });

  afterAll(async () => {
    await jotform.deleteLabel(createdLabelId);
  });

  it('updates label properly', async () => {
    const response = await jotform.updateLabel(createdLabelId, {
      name: 'Updated label',
      color: '#123456',
    });

    expect(response).toMatchObject({
      name: 'Updated label',
      color: '#123456',
    });
  });
});

describe('getLabelResources()', () => {
  let createdLabelId: string;

  beforeAll(async () => {
    const response = await jotform.createLabel({ name: 'Resources label', color: '#EEEEEE' });

    const anyResponse = z.any().parse(response);

    createdLabelId = anyResponse.id;
  });

  afterAll(async () => {
    await jotform.deleteLabel(createdLabelId);
  });

  it('returns label resources properly', async () => {
    const response = await jotform.getLabelResources(createdLabelId);

    expect(response).toMatchObject(expect.any(Array));
  });
});

describe('addResourcesToLabel()', () => {
  const resource = {
    id: TEST_FORM_ID,
    type: 'form',
  } as const;

  let createdLabelId: string;

  beforeAll(async () => {
    const response = await jotform.createLabel({ name: 'Add resource label', color: '#C0FFEE' });

    const anyResponse = z.any().parse(response);

    createdLabelId = anyResponse.id;
  });

  afterAll(async () => {
    await jotform.deleteLabel(createdLabelId);
  });

  it('adds resource to label properly', async () => {
    const response = await jotform.addResourcesToLabel(createdLabelId, resource);

    expect(response).toMatchObject(expect.any(Array));

    const anyResponse = z.any().parse(response);

    const item = anyResponse[0];

    expect(item).toMatchObject({
      id: resource.id,
      type: expect.any(String),
    });
  });
});

describe('removeResourcesFromLabel()', () => {
  const resource = {
    id: TEST_FORM_ID,
    type: 'form',
  } as const;

  let createdLabelId: string;

  beforeAll(async () => {
    const response = await jotform.createLabel({ name: 'Remove resource label', color: '#BADA55' });

    const anyResponse = z.any().parse(response);

    createdLabelId = anyResponse.id;

    await jotform.addResourcesToLabel(createdLabelId, resource);
  });

  afterAll(async () => {
    await jotform.deleteLabel(createdLabelId);
  });

  it('removes resources from label properly', async () => {
    const response = await jotform.removeResourcesFromLabel(createdLabelId, [resource]);

    expect(response).toMatchObject(expect.any(Array));

    const anyResponse = z.any().parse(response);

    const item = anyResponse[0];

    expect(item).toMatchObject({
      id: resource.id,
      type: expect.any(String),
    });
  });
});

describe('deleteLabel()', () => {
  let createdLabelId: string;

  beforeAll(async () => {
    const response = await jotform.createLabel({ name: 'Disposable label', color: '#654321' });

    const anyResponse = z.any().parse(response);

    createdLabelId = anyResponse.id;
  });

  afterAll(async () => {
    if (createdLabelId) {
      await jotform.deleteLabel(createdLabelId);
    }
  });

  it('deletes label properly', async () => {
    const response = await jotform.deleteLabel(createdLabelId);

    expect(response).toBe(true);

    createdLabelId = '';
  });
});

/**
 * Folders
 */

describe('getFolders()', () => {
  it('returns folders data properly', async () => {
    const response = await jotform.getFolders();

    expect(response).toMatchObject({
      id: TEST_ROOT_FOLDER_ID,
      // Not a mistake, actual discrepancy in API response
      forms: expect.any(Object),
      subfolders: expect.any(Array),
    });

    const anyResponse = z.any().parse(response);

    const testFolder = anyResponse.subfolders.find(
      (folder: { id: string }) => folder.id === TEST_FOLDER_ID,
    );

    expect(testFolder).toBeDefined();

    expect(testFolder).toEqual(
      expect.objectContaining({
        id: TEST_FOLDER_ID,
        forms: expect.any(Array),
        subfolders: expect.any(Array),
      }),
    );

    const testSubfolder = testFolder.subfolders.find(
      (subfolder: { id: string }) => subfolder.id === TEST_SUBFOLDER_ID,
    );

    expect(testSubfolder).toBeDefined();

    expect(testSubfolder).toEqual(
      expect.objectContaining({
        id: TEST_SUBFOLDER_ID,
        forms: expect.any(Array),
        subfolders: expect.any(Array),
      }),
    );
  });
});

describe('getFolder()', () => {
  it('returns folder data properly', async () => {
    const response = await jotform.getFolder(TEST_FOLDER_ID);

    expect(response).toMatchObject({
      id: TEST_FOLDER_ID,
      forms: expect.any(Object),
    });
  });
});

describe('createFolder()', () => {
  const createdFolderIds: string[] = [];

  afterAll(async () => {
    await asyncForEach(createdFolderIds, async (folderId) => {
      // This should be awaited, but this Promise never resolves
      jotform.deleteFolder(folderId);
    });
  });

  it('creates folder properly', async () => {
    const response = await jotform.createFolder({ name: 'Test folder' });

    expect(response).toMatchObject({
      id: expect.any(String),
    });

    const anyResponse = z.any().parse(response);

    // Store folder ID for later use
    createdFolderIds.push(anyResponse.id);
  });
});

describe('updateFolder()', () => {
  let createdFolderId: string;

  beforeAll(async () => {
    const response = await jotform.createFolder({ name: 'Test folder' });

    const anyResponse = z.any().parse(response);

    createdFolderId = anyResponse.id;
  });

  afterAll(async () => {
    // This should be awaited, but this Promise never resolves
    jotform.deleteFolder(createdFolderId);
  });

  it('updates folder properly', async () => {
    const response = await jotform.updateFolder(createdFolderId, { name: 'Test folder 2' });

    expect(response).toMatchObject({
      name: 'Test folder 2',
    });
  });
});

describe.todo('addFormToFolder()');

describe.todo('addFormsToFolder()');

describe('deleteFolder()', () => {
  let createdFolderId: string;

  beforeAll(async () => {
    const response = await jotform.createFolder({ name: 'Test folder' });

    const anyResponse = z.any().parse(response);

    createdFolderId = anyResponse.id;
  });

  it('deletes folder properly', async () => {
    const response = await jotform.deleteFolder(createdFolderId);

    expect(response).toBe('Folder deleted successfully');
  });
});

/**
 * Reports
 */

describe('getReports()', () => {
  it('returns reports data properly', async () => {
    const response = await jotform.getReports();

    expect(response).toMatchObject(expect.any(Array));
  });
});

describe('getReport()', () => {
  it('returns report data properly', async () => {
    const response = await jotform.getReport(TEST_REPORT_ID);

    expect(response).toMatchObject({
      id: TEST_REPORT_ID,
    });
  });
});

describe('deleteReport()', () => {
  let createdReportId: string;

  beforeAll(async () => {
    const response = await jotform.createFormReport(TEST_FORM_ID, {
      title: 'Test report',
      list_type: 'grid',
      fields: 'ip,dt,1',
    });

    const anyResponse = z.any().parse(response);

    createdReportId = anyResponse.id;
  });

  it('deletes report properly', async () => {
    const response = await jotform.deleteReport(createdReportId);

    expect(response).toBe(true);
  });
});

/**
 * Submissions
 */

describe('getSubmissions()', () => {
  it('returns submissions data properly', async () => {
    const response = await jotform.getSubmissions({
      filter: {
        status: 'ACTIVE',
      },
    });

    expect(response).toMatchObject(expect.any(Array));

    const anyResponse = z.any().parse(response);

    const testFormSubmission = anyResponse.find(
      (submission: { id: string }) => submission.id === TEST_FORM_SUBMISSION_ID,
    );

    expect(testFormSubmission).toBeDefined();
  });
});

describe.todo('getSubmission()');

describe.todo('editSubmission()');

describe('deleteSubmission()', () => {
  let createdSubmissionId: string;

  beforeAll(async () => {
    const response = await jotform.createFormSubmission(TEST_FORM_ID, {
      submission: {
        1: 'Test value',
      },
    });

    const anyResponse = z.any().parse(response);

    createdSubmissionId = anyResponse.submissionID;
  });

  it('deletes form submission properly', async () => {
    const response = await jotform.deleteSubmission(createdSubmissionId);

    expect(response).toBe(`Submission #${createdSubmissionId} deleted successfully.`);
  });
});
