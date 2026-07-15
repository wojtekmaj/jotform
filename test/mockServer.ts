import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';

export const API_URL: string = 'https://api.jotform.test';

const TEST_FORM_ID = '232143945675058';
const TEST_FORM_SUBMISSION_ID = '5747651132391058779';
const TEST_FORM_QUESTION_ID = '1';
const TEST_ROOT_LABEL_ID = '0198c14737e87f33877e374156563c7be95a';
const TEST_LABEL_ID = '019a15aba90c7fc2a2f9b95959c72c8345cc';
const TEST_SUBLABEL_ID = '019a15b168537cd0bec4853947b190efb857';
const TEST_REPORT_ID = '232152641243042';

let formSequence = 0;
let questionSequence = 100;
let reportSequence = 0;
let submissionSequence = 0;
let webhookSequence = 0;
let labelSequence = 0;

const settings: Record<string, unknown> = {
  email: 'test@example.com',
  website: 'https://example.com',
};

const forms = new Map<string, Record<string, unknown>>([
  [TEST_FORM_ID, { id: TEST_FORM_ID, title: 'Test form', status: 'ENABLED' }],
]);

const formProperties = new Map<string, Record<string, unknown>>([
  [TEST_FORM_ID, { pagetitle: 'Test form' }],
]);

const questions = new Map<string, Record<string, unknown>>([
  [TEST_FORM_QUESTION_ID, { qid: Number(TEST_FORM_QUESTION_ID), type: 'control_textbox' }],
]);

const reports = new Map<string, Record<string, unknown>>([
  [TEST_REPORT_ID, { id: TEST_REPORT_ID, title: 'Test report' }],
]);

const submissions = new Map<string, Record<string, unknown>>([
  [TEST_FORM_SUBMISSION_ID, { id: TEST_FORM_SUBMISSION_ID, form_id: TEST_FORM_ID }],
]);

const webhooks = new Map<string, string>();

const labels = new Map<string, Record<string, unknown>>();

function jotformResponse(content: unknown) {
  return HttpResponse.json({
    responseCode: 200,
    message: 'success',
    content,
  });
}

function jotformError(message: string) {
  return HttpResponse.json({
    responseCode: 401,
    message,
    content: [],
  });
}

async function getFormData(request: Request): Promise<Record<string, string>> {
  const formData = await request.formData();

  return Object.fromEntries(Array.from(formData.entries(), ([key, value]) => [key, String(value)]));
}

function getOrCreateProperties(formId: string): Record<string, unknown> {
  const properties = formProperties.get(formId) ?? { pagetitle: 'Test form' };

  formProperties.set(formId, properties);

  return properties;
}

function createForm(): Record<string, unknown> {
  formSequence += 1;

  const id = `created-form-${formSequence}`;
  const form = { id, title: 'Test form', status: 'ENABLED' };

  forms.set(id, form);

  return form;
}

function createQuestion(question: Record<string, unknown> = {}): Record<string, unknown> {
  questionSequence += 1;

  const createdQuestion = { qid: questionSequence, ...question };

  questions.set(String(questionSequence), createdQuestion);

  return createdQuestion;
}

function createReport(): Record<string, unknown> {
  reportSequence += 1;

  const id = `created-report-${reportSequence}`;
  const report = { id, title: 'Test report' };

  reports.set(id, report);

  return report;
}

function createSubmission(): Record<string, unknown> {
  submissionSequence += 1;

  const submissionID = `created-submission-${submissionSequence}`;
  const submission = { id: submissionID, submissionID, form_id: TEST_FORM_ID };

  submissions.set(submissionID, submission);

  return submission;
}

export const server: ReturnType<typeof setupServer> = setupServer(
  http.get(`${API_URL}/user/history`, () => jotformResponse([])),
  http.get(`${API_URL}/user/settings`, () => jotformResponse(settings)),
  http.post(`${API_URL}/user/settings`, async ({ request }) => {
    Object.assign(settings, await getFormData(request));

    return jotformResponse(settings);
  }),
  http.get(`${API_URL}/user/subusers`, () => jotformError('User is not Allowed')),
  http.get(`${API_URL}/user/usage`, () => jotformResponse({ api: 0 })),
  http.get(`${API_URL}/user`, () => jotformResponse({ email: 'test@example.com' })),
  http.get(`${API_URL}/system/plan/:planName`, ({ params }) =>
    jotformResponse({ name: params.planName }),
  ),

  http.get(`${API_URL}/user/forms`, () => jotformResponse(Array.from(forms.values()))),
  http.post(`${API_URL}/user/forms`, () => jotformResponse(createForm())),
  http.put(`${API_URL}/user/forms`, () => jotformResponse(createForm())),
  http.get(`${API_URL}/form/:formId`, ({ params }) =>
    jotformResponse(forms.get(String(params.formId)) ?? { id: params.formId }),
  ),
  http.delete(`${API_URL}/form/:formId`, ({ params }) => {
    const id = String(params.formId);

    forms.delete(id);

    return jotformResponse({ id });
  }),
  http.post(`${API_URL}/form/:formId/clone`, () => jotformResponse(createForm())),
  http.get(`${API_URL}/form/:formId/files`, () => jotformResponse([])),

  http.get(`${API_URL}/form/:formId/properties`, ({ params }) =>
    jotformResponse(getOrCreateProperties(String(params.formId))),
  ),
  http.get(`${API_URL}/form/:formId/properties/:key`, ({ params }) => {
    const properties = getOrCreateProperties(String(params.formId));
    const key = String(params.key);

    return jotformResponse({ [key]: properties[key] ?? 'Test form' });
  }),
  http.post(`${API_URL}/form/:formId/properties`, async ({ params, request }) => {
    const properties = getOrCreateProperties(String(params.formId));
    const body = await getFormData(request);
    const pagetitle = body['properties[pagetitle]'];

    if (pagetitle !== undefined) {
      properties.pagetitle = pagetitle;
    }

    return jotformResponse({ ...properties, formID: params.formId });
  }),
  http.put(`${API_URL}/form/:formId/properties`, async ({ params, request }) => {
    const properties = getOrCreateProperties(String(params.formId));
    const body = (await request.json()) as { properties?: Record<string, unknown> };

    Object.assign(properties, body.properties);

    return jotformResponse({ ...properties, formID: params.formId });
  }),

  http.get(`${API_URL}/form/:formId/questions`, () =>
    jotformResponse(Object.fromEntries(questions)),
  ),
  http.post(`${API_URL}/form/:formId/questions`, async ({ request }) => {
    const body = await getFormData(request);
    const question = Object.fromEntries(
      Object.entries(body)
        .filter(([key]) => key.startsWith('question['))
        .map(([key, value]) => [key.slice(9, -1), value]),
    );

    return jotformResponse(createQuestion(question));
  }),
  http.put(`${API_URL}/form/:formId/questions`, async ({ request }) => {
    const body = (await request.json()) as { questions?: Record<string, unknown>[] };

    return jotformResponse((body.questions ?? []).map((question) => createQuestion(question)));
  }),
  http.get(`${API_URL}/form/:formId/question/:questionId`, ({ params }) =>
    jotformResponse(questions.get(String(params.questionId)) ?? {}),
  ),
  http.post(`${API_URL}/form/:formId/question/:questionId`, async ({ params, request }) => {
    const id = String(params.questionId);
    const body = await getFormData(request);
    const updates = Object.fromEntries(
      Object.entries(body)
        .filter(([key]) => key.startsWith('question['))
        .map(([key, value]) => [key.slice(9, -1), value]),
    );
    const question = { ...(questions.get(id) ?? {}), ...updates };

    questions.set(id, question);

    return jotformResponse([question]);
  }),
  http.delete(`${API_URL}/form/:formId/question/:questionId`, ({ params }) => {
    const id = String(params.questionId);

    questions.delete(id);

    return jotformResponse(`QuestionID #${id} successfully deleted.`);
  }),

  http.get(`${API_URL}/form/:formId/reports`, () => jotformResponse(Array.from(reports.values()))),
  http.post(`${API_URL}/form/:formId/reports`, () => jotformResponse(createReport())),
  http.get(`${API_URL}/user/reports`, () => jotformResponse(Array.from(reports.values()))),
  http.get(`${API_URL}/report/:reportId`, () =>
    jotformError("You're not authorized to use (/report-id)"),
  ),
  http.delete(`${API_URL}/report/:reportId`, ({ params }) => {
    reports.delete(String(params.reportId));

    return jotformResponse(true);
  }),

  http.get(`${API_URL}/form/:formId/submissions`, () =>
    jotformResponse(Array.from(submissions.values())),
  ),
  http.post(`${API_URL}/form/:formId/submissions`, () => jotformResponse(createSubmission())),
  http.put(`${API_URL}/form/:formId/submissions`, async ({ request }) => {
    const body = await request.json();
    const count = Array.isArray(body) ? body.length : 1;

    return jotformResponse(Array.from({ length: count }, () => createSubmission()));
  }),
  http.get(`${API_URL}/user/submissions`, () => jotformResponse(Array.from(submissions.values()))),
  http.get(`${API_URL}/submission/:submissionId`, ({ params }) =>
    jotformResponse(
      submissions.get(String(params.submissionId)) ?? {
        id: params.submissionId,
        form_id: TEST_FORM_ID,
      },
    ),
  ),
  http.post(`${API_URL}/submission/:submissionId`, async ({ params, request }) => {
    const id = String(params.submissionId);
    const body = await getFormData(request);
    const submission = { ...(submissions.get(id) ?? { id }), ...body };

    submissions.set(id, submission);

    return jotformResponse(submission);
  }),
  http.delete(`${API_URL}/submission/:submissionId`, ({ params }) => {
    const id = String(params.submissionId);

    submissions.delete(id);

    return jotformResponse(`Submission #${id} deleted successfully.`);
  }),

  http.get(`${API_URL}/form/:formId/webhooks`, () => jotformResponse(Object.fromEntries(webhooks))),
  http.post(`${API_URL}/form/:formId/webhooks`, async ({ request }) => {
    const body = await getFormData(request);
    const id = String(webhookSequence);

    webhookSequence += 1;
    webhooks.set(id, body.webhookURL ?? 'https://example.com/webhook');

    return jotformResponse(Object.fromEntries(webhooks));
  }),
  http.delete(`${API_URL}/form/:formId/webhooks/:webhookId`, ({ params }) => {
    webhooks.delete(String(params.webhookId));

    return jotformResponse({});
  }),

  http.get(`${API_URL}/user/labels`, () =>
    jotformResponse({
      id: TEST_ROOT_LABEL_ID,
      sublabels: [
        {
          id: TEST_LABEL_ID,
          sublabels: [
            {
              id: TEST_SUBLABEL_ID,
              sublabels: [],
            },
          ],
        },
      ],
    }),
  ),
  http.post(`${API_URL}/label`, async ({ request }) => {
    labelSequence += 1;

    const body = await getFormData(request);
    const label = {
      id: `created-label-${labelSequence}`,
      name: body.name,
      color: body.color,
      resources: [],
    };

    labels.set(label.id, label);

    return jotformResponse(label);
  }),
  http.get(`${API_URL}/label/:labelId`, ({ params }) =>
    jotformResponse(labels.get(String(params.labelId)) ?? { id: params.labelId }),
  ),
  http.put(`${API_URL}/label/:labelId`, async ({ params, request }) => {
    const id = String(params.labelId);
    const label = {
      ...(labels.get(id) ?? { id, resources: [] }),
      ...((await request.json()) as Record<string, unknown>),
    };

    labels.set(id, label);

    return jotformResponse(label);
  }),
  http.get(`${API_URL}/label/:labelId/resources`, ({ params }) => {
    const label = labels.get(String(params.labelId));

    return jotformResponse(label?.resources ?? []);
  }),
  http.put(`${API_URL}/label/:labelId/add-resources`, async ({ params, request }) => {
    const id = String(params.labelId);
    const body = (await request.json()) as { resources: unknown[] };
    const label = labels.get(id) ?? { id };

    labels.set(id, { ...label, resources: body.resources });

    return jotformResponse(body.resources);
  }),
  http.put(`${API_URL}/label/:labelId/remove-resources`, async ({ params, request }) => {
    const id = String(params.labelId);
    const body = (await request.json()) as { resources: unknown[] };
    const label = labels.get(id) ?? { id };

    labels.set(id, { ...label, resources: [] });

    return jotformResponse(body.resources);
  }),
  http.delete(`${API_URL}/label/:labelId`, ({ params }) => {
    labels.delete(String(params.labelId));

    return jotformResponse(true);
  }),
);
