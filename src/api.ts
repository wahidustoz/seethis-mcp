export interface CreateVisualizationRequest {
  content: string;
  contentType: string;
  iv: string;
  isCompressed?: boolean;
}

export interface CreateVisualizationResponse {
  slug: string;
  url: string;
  expiresAt: string;
}

export interface GetVisualizationResponse {
  slug: string;
  content: string;
  contentType: string;
  iv: string;
  createdAt: string;
  expiresAt: string;
  isCompressed: boolean;
}

export class SeethisApi {
  constructor(private baseUrl: string) {}

  async createVisualization(
    request: CreateVisualizationRequest,
  ): Promise<CreateVisualizationResponse> {
    const response = await fetch(`${this.baseUrl}/api/v1/viz`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(
        `Failed to create visualization (${response.status}): ${error}`,
      );
    }

    return response.json() as Promise<CreateVisualizationResponse>;
  }

  async getVisualization(slug: string): Promise<GetVisualizationResponse> {
    const response = await fetch(`${this.baseUrl}/api/v1/viz/${slug}`);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(
        `Failed to get visualization (${response.status}): ${error}`,
      );
    }

    return response.json() as Promise<GetVisualizationResponse>;
  }
}
