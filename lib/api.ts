
const API_BASE = '';

interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  body?: any;
}

class ApiClient {
  private async request(endpoint: string, options: ApiRequestOptions = {}) {
    const url = `${API_BASE}/api${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
      config.body = JSON.stringify(config.body);
    }

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // User management
  async getUsers() {
    return this.request('/users');
  }

  async createUser(userData: any) {
    return this.request('/users', {
      method: 'POST',
      body: userData,
    });
  }

  async updateUser(id: string, userData: any) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: userData,
    });
  }

  async deleteUser(id: string) {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Team management
  async getTeams() {
    return this.request('/teams');
  }

  async createTeam(teamData: any) {
    return this.request('/teams', {
      method: 'POST',
      body: teamData,
    });
  }

  async updateTeam(id: string, teamData: any) {
    return this.request(`/teams/${id}`, {
      method: 'PUT',
      body: teamData,
    });
  }

  async deleteTeam(id: string) {
    return this.request(`/teams/${id}`, {
      method: 'DELETE',
    });
  }

  // Game session management
  async getGameSessions() {
    return this.request('/game-sessions');
  }

  async getGameSession(id: string) {
    return this.request(`/game-sessions/${id}`);
  }

  async createGameSession(sessionData: any) {
    return this.request('/game-sessions', {
      method: 'POST',
      body: sessionData,
    });
  }

  async updateGameSession(id: string, sessionData: any) {
    return this.request(`/game-sessions/${id}`, {
      method: 'PUT',
      body: sessionData,
    });
  }

  async startGameSession(id: string) {
    return this.request(`/game-sessions/${id}/start`, {
      method: 'POST',
    });
  }

  // Round management
  async getRounds(gameSessionId?: string) {
    const params = gameSessionId ? `?gameSessionId=${gameSessionId}` : '';
    return this.request(`/rounds${params}`);
  }

  async createRound(roundData: any) {
    return this.request('/rounds', {
      method: 'POST',
      body: roundData,
    });
  }

  async activateRound(id: string) {
    return this.request(`/rounds/${id}/activate`, {
      method: 'POST',
    });
  }

  // Question management
  async getQuestions(roundId?: string) {
    const params = roundId ? `?roundId=${roundId}` : '';
    return this.request(`/questions${params}`);
  }

  async getQuestion(id: string) {
    return this.request(`/questions/${id}`);
  }

  async createQuestion(questionData: any) {
    return this.request('/questions', {
      method: 'POST',
      body: questionData,
    });
  }

  async updateQuestion(id: string, questionData: any) {
    return this.request(`/questions/${id}`, {
      method: 'PUT',
      body: questionData,
    });
  }

  // Submission management
  async getSubmissions(params?: { questionId?: string; roundId?: string; userId?: string; teamId?: string }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) searchParams.append(key, value);
      });
    }
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.request(`/submissions${query}`);
  }

  async createSubmission(submissionData: any) {
    return this.request('/submissions', {
      method: 'POST',
      body: submissionData,
    });
  }

  // Leaderboards
  async getLeaderboards(type: 'individual' | 'team' | 'both' = 'both') {
    return this.request(`/leaderboards?type=${type}`);
  }

  // File upload
  async uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return fetch('/api/upload', {
      method: 'POST',
      body: formData,
    }).then(res => {
      if (!res.ok) {
        throw new Error('Upload failed');
      }
      return res.json();
    });
  }

  // Case file upload
  async uploadCaseFile(file: File, description?: string) {
    const formData = new FormData();
    formData.append('file', file);
    if (description) {
      formData.append('description', description);
    }

    return fetch('/api/upload/case-file', {
      method: 'POST',
      body: formData,
    }).then(res => {
      if (!res.ok) {
        throw new Error('Case file upload failed');
      }
      return res.json();
    });
  }

  // Question Categories
  async getQuestionCategories() {
    return this.request('/question-categories');
  }

  async createQuestionCategory(categoryData: any) {
    return this.request('/question-categories', {
      method: 'POST',
      body: categoryData,
    });
  }

  async updateQuestionCategory(id: string, categoryData: any) {
    return this.request(`/question-categories/${id}`, {
      method: 'PUT',
      body: categoryData,
    });
  }

  async deleteQuestionCategory(id: string) {
    return this.request(`/question-categories/${id}`, {
      method: 'DELETE',
    });
  }

  // Question Tags
  async getQuestionTags() {
    return this.request('/question-tags');
  }

  async createQuestionTag(tagData: any) {
    return this.request('/question-tags', {
      method: 'POST',
      body: tagData,
    });
  }

  // Case Files
  async getCaseFiles() {
    return this.request('/case-files');
  }

  async createCaseFile(fileData: any) {
    return this.request('/case-files', {
      method: 'POST',
      body: fileData,
    });
  }

  async updateCaseFile(id: string, fileData: any) {
    return this.request(`/case-files/${id}`, {
      method: 'PUT',
      body: fileData,
    });
  }

  async deleteCaseFile(id: string) {
    return this.request(`/case-files/${id}`, {
      method: 'DELETE',
    });
  }

  // Bulk Operations
  async getBulkOperations(type?: string, status?: string) {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (status) params.append('status', status);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/bulk-operations${query}`);
  }

  async createBulkOperation(operationData: any) {
    return this.request('/bulk-operations', {
      method: 'POST',
      body: operationData,
    });
  }

  async updateBulkOperation(id: string, updateData: any) {
    return this.request(`/bulk-operations/${id}`, {
      method: 'PUT',
      body: updateData,
    });
  }

  // Import/Export
  async importUsers(userData: any[], options?: any) {
    return this.request('/import/users', {
      method: 'POST',
      body: { users: userData, options },
    });
  }

  async exportUsers(format: 'json' | 'csv' = 'json', includeInactive = false) {
    const params = new URLSearchParams();
    params.append('format', format);
    if (includeInactive) params.append('includeInactive', 'true');
    
    if (format === 'csv') {
      const response = await fetch(`/api/export/users?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Export failed');
      }
      return response.blob();
    }
    
    return this.request(`/export/users?${params.toString()}`);
  }

  // Analytics
  async getDashboardAnalytics() {
    return this.request('/analytics/dashboard');
  }
}

export const apiClient = new ApiClient();
