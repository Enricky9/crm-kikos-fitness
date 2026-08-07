import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import type { FastifyInstance } from "fastify";
import type { OpenAPIV3 } from "openapi-types";

type ApiSchema = OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject;
type JsonContent = NonNullable<OpenAPIV3.ResponseObject["content"]>;

const errorResponseSchema: OpenAPIV3.SchemaObject = {
  type: "object",
  required: ["error"],
  properties: {
    error: {
      type: "object",
      required: ["code", "message", "details"],
      properties: {
        code: { type: "string" },
        message: { type: "string" },
        details: {
          nullable: true,
          oneOf: [{ type: "object" }, { type: "array", items: {} }, { type: "string" }]
        }
      }
    }
  }
};

const paginationSchema: OpenAPIV3.SchemaObject = {
  type: "object",
  required: ["page", "pageSize", "total", "totalPages"],
  properties: {
    page: { type: "integer", minimum: 1 },
    pageSize: { type: "integer", minimum: 1 },
    total: { type: "integer", minimum: 0 },
    totalPages: { type: "integer", minimum: 0 }
  }
};

const sellerSchema: OpenAPIV3.SchemaObject = {
  type: "object",
  required: ["id", "name", "email"],
  properties: {
    id: { type: "string", format: "uuid" },
    name: { type: "string" },
    email: { type: "string", format: "email" }
  }
};

const leadSchema: OpenAPIV3.SchemaObject = {
  type: "object",
  required: ["id", "name", "email", "phone", "company", "source", "dealsCount", "createdAt", "updatedAt"],
  properties: {
    id: { type: "string", format: "uuid" },
    name: { type: "string" },
    email: { type: "string", format: "email", nullable: true },
    phone: { type: "string" },
    company: { type: "string", nullable: true },
    source: { type: "string", nullable: true },
    dealsCount: { type: "integer", minimum: 0 },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" }
  }
};

const dealStatusSchema: OpenAPIV3.SchemaObject = {
  type: "string",
  enum: ["NEW", "IN_PROGRESS", "PROPOSAL", "WON", "LOST"]
};

const dealSchema: OpenAPIV3.SchemaObject = {
  type: "object",
  required: [
    "id",
    "title",
    "description",
    "value",
    "status",
    "leadId",
    "sellerId",
    "lostReason",
    "closedAt",
    "createdAt",
    "updatedAt",
    "lead",
    "seller"
  ],
  properties: {
    id: { type: "string", format: "uuid" },
    title: { type: "string" },
    description: { type: "string", nullable: true },
    value: { type: "string", example: "1299.90" },
    status: dealStatusSchema,
    leadId: { type: "string", format: "uuid" },
    sellerId: { type: "string", format: "uuid" },
    lostReason: { type: "string", nullable: true },
    closedAt: { type: "string", format: "date-time", nullable: true },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
    lead: {
      type: "object",
      nullable: true,
      required: ["id", "name", "company"],
      properties: {
        id: { type: "string", format: "uuid" },
        name: { type: "string" },
        company: { type: "string", nullable: true }
      }
    },
    seller: {
      ...sellerSchema,
      nullable: true
    }
  }
};

const commentSchema: OpenAPIV3.SchemaObject = {
  type: "object",
  required: ["id", "content", "authorId", "leadId", "dealId", "createdAt", "author"],
  properties: {
    id: { type: "string", format: "uuid" },
    content: { type: "string" },
    authorId: { type: "string", format: "uuid" },
    leadId: { type: "string", format: "uuid", nullable: true },
    dealId: { type: "string", format: "uuid", nullable: true },
    createdAt: { type: "string", format: "date-time" },
    author: {
      ...sellerSchema,
      nullable: true
    }
  }
};

const statusHistorySchema: OpenAPIV3.SchemaObject = {
  type: "object",
  required: ["id", "dealId", "fromStatus", "toStatus", "changedBy", "createdAt", "changedByUser"],
  properties: {
    id: { type: "string", format: "uuid" },
    dealId: { type: "string", format: "uuid" },
    fromStatus: { ...dealStatusSchema, nullable: true },
    toStatus: dealStatusSchema,
    changedBy: { type: "string", format: "uuid" },
    createdAt: { type: "string", format: "date-time" },
    changedByUser: {
      ...sellerSchema,
      nullable: true
    }
  }
};

const dealAiSummarySchema: OpenAPIV3.SchemaObject = {
  type: "object",
  required: ["summary", "provider", "generatedAt"],
  properties: {
    summary: { type: "string" },
    provider: { type: "string", example: "mock" },
    generatedAt: { type: "string", format: "date-time" }
  }
};

const bearerSecurity: OpenAPIV3.SecurityRequirementObject[] = [{ bearerAuth: [] }];

const errorResponses = {
  "400": { description: "Requisicao invalida", content: jsonContent(errorResponseSchema) },
  "401": { description: "Nao autenticado", content: jsonContent(errorResponseSchema) },
  "403": { description: "Acesso negado", content: jsonContent(errorResponseSchema) },
  "404": { description: "Recurso nao encontrado", content: jsonContent(errorResponseSchema) },
  "422": { description: "Erro de validacao", content: jsonContent(errorResponseSchema) },
  "500": { description: "Erro interno", content: jsonContent(errorResponseSchema) }
} satisfies OpenAPIV3.ResponsesObject;

function jsonContent(schema: ApiSchema): JsonContent {
  return {
    "application/json": {
      schema
    }
  };
}

function objectResponse(name: string, schema: ApiSchema) {
  return {
    description: name,
    content: jsonContent(schema)
  } satisfies OpenAPIV3.ResponseObject;
}

const openApiDocument: OpenAPIV3.Document = {
  openapi: "3.0.3",
  info: {
    title: "Kikos Fitness CRM API",
    version: "0.1.0",
    description: "Documentacao da API REST do CRM de leads e negocios da Kikos Fitness."
  },
  servers: [{ url: "http://localhost:3333", description: "Ambiente local" }],
  tags: [
    { name: "Health" },
    { name: "Auth" },
    { name: "Sellers" },
    { name: "Leads" },
    { name: "Deals" },
    { name: "Comments" }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    },
    schemas: {
      ErrorResponse: errorResponseSchema,
      Lead: leadSchema,
      Deal: dealSchema,
      DealAiSummary: dealAiSummarySchema,
      Comment: commentSchema,
      Seller: sellerSchema,
      DealStatusHistory: statusHistorySchema,
      Pagination: paginationSchema
    }
  },
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Verifica disponibilidade da API",
        responses: {
          "200": objectResponse("Servico disponivel", {
            type: "object",
            required: ["status", "service"],
            properties: {
              status: { type: "string", example: "ok" },
              service: { type: "string", example: "kikos-crm-api" }
            }
          })
        }
      }
    },
    "/api/v1/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Autentica usuario e retorna JWT",
        requestBody: {
          required: true,
          content: jsonContent({
            type: "object",
            required: ["email", "password"],
            properties: {
              email: { type: "string", format: "email", example: "admin@kikos.local" },
              password: { type: "string", format: "password", example: "Admin123!" }
            }
          })
        },
        responses: {
          "200": objectResponse("Login realizado", {
            type: "object",
            required: ["token", "user"],
            properties: {
              token: { type: "string" },
              user: { $ref: "#/components/schemas/Seller" }
            }
          }),
          "401": errorResponses["401"],
          "422": errorResponses["422"]
        }
      }
    },
    "/api/v1/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Retorna o usuario autenticado",
        security: bearerSecurity,
        responses: {
          "200": objectResponse("Usuario autenticado", {
            type: "object",
            required: ["user"],
            properties: {
              user: { $ref: "#/components/schemas/Seller" }
            }
          }),
          "401": errorResponses["401"]
        }
      }
    },
    "/api/v1/sellers": {
      get: {
        tags: ["Sellers"],
        summary: "Lista vendedores",
        security: bearerSecurity,
        responses: {
          "200": objectResponse("Vendedores", {
            type: "object",
            required: ["sellers"],
            properties: {
              sellers: { type: "array", items: { $ref: "#/components/schemas/Seller" } }
            }
          }),
          "401": errorResponses["401"]
        }
      }
    },
    "/api/v1/leads": {
      get: {
        tags: ["Leads"],
        summary: "Lista leads com busca, ordenacao e paginacao",
        security: bearerSecurity,
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1, minimum: 1 } },
          { name: "pageSize", in: "query", schema: { type: "integer", default: 20, minimum: 1, maximum: 100 } },
          { name: "search", in: "query", schema: { type: "string" } },
          { name: "sortBy", in: "query", schema: { type: "string", enum: ["name", "createdAt"], default: "createdAt" } },
          { name: "sortOrder", in: "query", schema: { type: "string", enum: ["asc", "desc"], default: "desc" } }
        ],
        responses: {
          "200": objectResponse("Leads paginados", paginatedSchema("Lead")),
          ...errorResponses
        }
      },
      post: {
        tags: ["Leads"],
        summary: "Cria lead",
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: jsonContent({
            type: "object",
            required: ["name", "phone"],
            properties: {
              name: { type: "string" },
              email: { type: "string", format: "email", nullable: true },
              phone: { type: "string", minLength: 8 },
              company: { type: "string", nullable: true },
              source: { type: "string", nullable: true }
            }
          })
        },
        responses: {
          "201": wrappedResponse("lead", "Lead"),
          ...errorResponses
        }
      }
    },
    "/api/v1/leads/{leadId}": {
      get: {
        tags: ["Leads"],
        summary: "Busca lead por ID",
        security: bearerSecurity,
        parameters: [uuidParam("leadId")],
        responses: {
          "200": wrappedResponse("lead", "Lead"),
          ...errorResponses
        }
      },
      patch: {
        tags: ["Leads"],
        summary: "Atualiza lead",
        security: bearerSecurity,
        parameters: [uuidParam("leadId")],
        requestBody: {
          required: true,
          content: jsonContent({
            type: "object",
            minProperties: 1,
            properties: {
              name: { type: "string" },
              email: { type: "string", format: "email", nullable: true },
              phone: { type: "string", minLength: 8 },
              company: { type: "string", nullable: true },
              source: { type: "string", nullable: true }
            }
          })
        },
        responses: {
          "200": wrappedResponse("lead", "Lead"),
          ...errorResponses
        }
      }
    },
    "/api/v1/leads/{leadId}/comments": commentPath("leadId", "Lead"),
    "/api/v1/deals": {
      get: {
        tags: ["Deals"],
        summary: "Lista negocios para listagem ou kanban",
        security: bearerSecurity,
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1, minimum: 1 } },
          { name: "pageSize", in: "query", schema: { type: "integer", default: 20, minimum: 1, maximum: 100 } },
          { name: "status", in: "query", schema: dealStatusSchema },
          { name: "sellerId", in: "query", schema: { type: "string", format: "uuid" } },
          { name: "leadId", in: "query", schema: { type: "string", format: "uuid" } },
          { name: "search", in: "query", schema: { type: "string" } }
        ],
        responses: {
          "200": objectResponse("Negocios paginados", paginatedSchema("Deal")),
          ...errorResponses
        }
      },
      post: {
        tags: ["Deals"],
        summary: "Cria negocio",
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: jsonContent({
            type: "object",
            required: ["title", "value", "leadId", "sellerId"],
            properties: {
              title: { type: "string" },
              description: { type: "string", nullable: true },
              value: { type: "number", minimum: 0 },
              status: { type: "string", enum: ["NEW", "IN_PROGRESS", "PROPOSAL"], default: "NEW" },
              leadId: { type: "string", format: "uuid" },
              sellerId: { type: "string", format: "uuid" }
            }
          })
        },
        responses: {
          "201": wrappedResponse("deal", "Deal"),
          ...errorResponses
        }
      }
    },
    "/api/v1/deals/{dealId}": {
      get: {
        tags: ["Deals"],
        summary: "Busca negocio com comentarios e historico",
        security: bearerSecurity,
        parameters: [uuidParam("dealId")],
        responses: {
          "200": objectResponse("Detalhes do negocio", {
            type: "object",
            required: ["deal"],
            properties: {
              deal: {
                allOf: [
                  { $ref: "#/components/schemas/Deal" },
                  {
                    type: "object",
                    required: ["comments", "statusHistory"],
                    properties: {
                      comments: { type: "array", items: { $ref: "#/components/schemas/Comment" } },
                      statusHistory: { type: "array", items: { $ref: "#/components/schemas/DealStatusHistory" } }
                    }
                  }
                ]
              }
            }
          }),
          ...errorResponses
        }
      },
      patch: {
        tags: ["Deals"],
        summary: "Atualiza dados do negocio",
        security: bearerSecurity,
        parameters: [uuidParam("dealId")],
        requestBody: {
          required: true,
          content: jsonContent({
            type: "object",
            minProperties: 1,
            properties: {
              title: { type: "string" },
              description: { type: "string", nullable: true },
              value: { type: "number", minimum: 0 },
              leadId: { type: "string", format: "uuid" },
              sellerId: { type: "string", format: "uuid" }
            }
          })
        },
        responses: {
          "200": wrappedResponse("deal", "Deal"),
          ...errorResponses
        }
      }
    },
    "/api/v1/deals/{dealId}/status": {
      patch: statusOperation("Altera status do negocio")
    },
    "/api/v1/deals/{dealId}/win": {
      post: simpleDealAction("Marca negocio como ganho")
    },
    "/api/v1/deals/{dealId}/lose": {
      post: {
        ...simpleDealAction("Marca negocio como perdido"),
        requestBody: {
          required: false,
          content: jsonContent({
            type: "object",
            properties: {
              reason: { type: "string" }
            }
          })
        }
      }
    },
    "/api/v1/deals/{dealId}/reopen": {
      post: simpleDealAction("Reabre negocio fechado")
    },
    "/api/v1/deals/{dealId}/ai-summary": {
      post: {
        tags: ["Deals"],
        summary: "Gera resumo inteligente dos comentarios do negocio",
        security: bearerSecurity,
        parameters: [uuidParam("dealId")],
        responses: {
          "200": objectResponse("Resumo gerado", {
            type: "object",
            required: ["summary"],
            properties: {
              summary: { $ref: "#/components/schemas/DealAiSummary" }
            }
          }),
          ...errorResponses
        }
      }
    },
    "/api/v1/deals/{dealId}/comments": commentPath("dealId", "Deal")
  }
};

function uuidParam(name: string): OpenAPIV3.ParameterObject {
  return {
    name,
    in: "path",
    required: true,
    schema: { type: "string", format: "uuid" }
  };
}

function wrappedResponse(key: "lead" | "deal", schemaName: "Lead" | "Deal") {
  return objectResponse(`${schemaName} retornado`, {
    type: "object",
    required: [key],
    properties: {
      [key]: { $ref: `#/components/schemas/${schemaName}` }
    }
  });
}

function paginatedSchema(schemaName: "Lead" | "Deal"): OpenAPIV3.SchemaObject {
  return {
    type: "object",
    required: ["data", "pagination"],
    properties: {
      data: { type: "array", items: { $ref: `#/components/schemas/${schemaName}` } },
      pagination: { $ref: "#/components/schemas/Pagination" }
    }
  };
}

function commentPath(paramName: "leadId" | "dealId", tag: "Lead" | "Deal"): OpenAPIV3.PathItemObject {
  return {
    get: {
      tags: ["Comments"],
      summary: `Lista comentarios de ${tag === "Lead" ? "lead" : "negocio"}`,
      security: bearerSecurity,
      parameters: [uuidParam(paramName)],
      responses: {
        "200": objectResponse("Comentarios", {
          type: "object",
          required: ["comments"],
          properties: {
            comments: { type: "array", items: { $ref: "#/components/schemas/Comment" } }
          }
        }),
        ...errorResponses
      }
    },
    post: {
      tags: ["Comments"],
      summary: `Cria comentario em ${tag === "Lead" ? "lead" : "negocio"}`,
      security: bearerSecurity,
      parameters: [uuidParam(paramName)],
      requestBody: {
        required: true,
        content: jsonContent({
          type: "object",
          required: ["content"],
          properties: {
            content: { type: "string", minLength: 1 }
          }
        })
      },
      responses: {
        "201": objectResponse("Comentario criado", {
          type: "object",
          required: ["comment"],
          properties: {
            comment: { $ref: "#/components/schemas/Comment" }
          }
        }),
        ...errorResponses
      }
    }
  };
}

function statusOperation(summary: string): OpenAPIV3.OperationObject {
  return {
    tags: ["Deals"],
    summary,
    security: bearerSecurity,
    parameters: [uuidParam("dealId")],
    requestBody: {
      required: true,
      content: jsonContent({
        type: "object",
        required: ["status"],
        properties: {
          status: dealStatusSchema
        }
      })
    },
    responses: {
      "200": wrappedResponse("deal", "Deal"),
      ...errorResponses
    }
  };
}

function simpleDealAction(summary: string): OpenAPIV3.OperationObject {
  return {
    tags: ["Deals"],
    summary,
    security: bearerSecurity,
    parameters: [uuidParam("dealId")],
    responses: {
      "200": wrappedResponse("deal", "Deal"),
      ...errorResponses
    }
  };
}

export const registerSwagger = async (server: FastifyInstance) => {
  await server.register(swagger, {
    mode: "static",
    specification: {
      document: openApiDocument
    }
  });

  await server.register(swaggerUi, {
    routePrefix: "/api/docs",
    uiConfig: {
      docExpansion: "list",
      persistAuthorization: true
    }
  });
};
