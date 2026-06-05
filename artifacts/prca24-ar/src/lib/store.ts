import type { SurveyResponse } from "@workspace/api-client-react";

class Store {
  private lastSubmission: SurveyResponse | null = null;

  setLastSubmission(response: SurveyResponse) {
    this.lastSubmission = response;
  }

  getLastSubmission() {
    return this.lastSubmission;
  }
}

export const submissionStore = new Store();
