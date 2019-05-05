module.exports = {
  fieldName: 'Example1',
  fieldNodes: [
    {
      kind: 'Field',
      name: {
        kind: 'Name',
        value: 'Example1',
        loc: {
          start: 19,
          end: 27,
        },
      },
      arguments: [
        {
          kind: 'Argument',
          name: {
            kind: 'Name',
            value: 'where',
            loc: {
              start: 28,
              end: 33,
            },
          },
          value: {
            kind: 'ObjectValue',
            fields: [
              {
                kind: 'ObjectField',
                name: {
                  kind: 'Name',
                  value: 'id',
                  loc: {
                    start: 36,
                    end: 38,
                  },
                },
                value: {
                  kind: 'StringValue',
                  value: '5caa2b76dde13219cd3b4a0a',
                  block: false,
                  loc: {
                    start: 40,
                    end: 66,
                  },
                },
                loc: {
                  start: 36,
                  end: 66,
                },
              },
            ],
            loc: {
              start: 35,
              end: 67,
            },
          },
          loc: {
            start: 28,
            end: 67,
          },
        },
      ],
      directives: [],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: {
              kind: 'Name',
              value: 'id',
              loc: {
                start: 75,
                end: 77,
              },
            },
            arguments: [],
            directives: [],
            loc: {
              start: 75,
              end: 77,
            },
          },
          {
            kind: 'Field',
            name: {
              kind: 'Name',
              value: 'first',
              loc: {
                start: 82,
                end: 92,
              },
            },
            arguments: [],
            directives: [],
            loc: {
              start: 82,
              end: 92,
            },
          },
          {
            kind: 'Field',
            name: {
              kind: 'Name',
              value: 'second',
              loc: {
                start: 97,
                end: 107,
              },
            },
            arguments: [],
            directives: [],
            loc: {
              start: 97,
              end: 107,
            },
          },
          {
            kind: 'Field',
            name: {
              kind: 'Name',
              value: 'createdAt',
              loc: {
                start: 112,
                end: 121,
              },
            },
            arguments: [],
            directives: [],
            loc: {
              start: 112,
              end: 121,
            },
          },
        ],
        loc: {
          start: 69,
          end: 125,
        },
      },
      loc: {
        start: 19,
        end: 125,
      },
    },
  ],
  returnType: 'Example1',
  parentType: 'Query',
  path: {
    key: 'Example1',
  },
  schema: {
    __validationErrors: [],
    __allowedLegacyNames: [],
    _queryType: 'Query',
    _mutationType: 'Mutation',
    _subscriptionType: 'Subscription',
    _directives: ['@cacheControl', '@skip', '@include', '@deprecated'],
    astNode: {
      kind: 'SchemaDefinition',
      directives: [],
      operationTypes: [
        {
          kind: 'OperationTypeDefinition',
          operation: 'query',
          type: {
            kind: 'NamedType',
            name: {
              kind: 'Name',
              value: 'Query',
              loc: {
                start: 18,
                end: 23,
              },
            },
            loc: {
              start: 18,
              end: 23,
            },
          },
          loc: {
            start: 11,
            end: 23,
          },
        },
        {
          kind: 'OperationTypeDefinition',
          operation: 'mutation',
          type: {
            kind: 'NamedType',
            name: {
              kind: 'Name',
              value: 'Mutation',
              loc: {
                start: 36,
                end: 44,
              },
            },
            loc: {
              start: 36,
              end: 44,
            },
          },
          loc: {
            start: 26,
            end: 44,
          },
        },
        {
          kind: 'OperationTypeDefinition',
          operation: 'subscription',
          type: {
            kind: 'NamedType',
            name: {
              kind: 'Name',
              value: 'Subscription',
              loc: {
                start: 61,
                end: 73,
              },
            },
            loc: {
              start: 61,
              end: 73,
            },
          },
          loc: {
            start: 47,
            end: 73,
          },
        },
      ],
      loc: {
        start: 0,
        end: 75,
      },
    },
    _typeMap: {
      Query: 'Query',
      String: 'String',
      Example1WhereOneInput: 'Example1WhereOneInput',
      ID: 'ID',
      Example1: 'Example1',
      DateTime: 'DateTime',
      Example2WhereOneInput: 'Example2WhereOneInput',
      Example2: 'Example2',
      Mutation: 'Mutation',
      User: 'User',
      Example1CreateInput: 'Example1CreateInput',
      Example2CreateInput: 'Example2CreateInput',
      Subscription: 'Subscription',
      __Schema: '__Schema',
      __Type: '__Type',
      __TypeKind: '__TypeKind',
      Boolean: 'Boolean',
      __Field: '__Field',
      __InputValue: '__InputValue',
      __EnumValue: '__EnumValue',
      __Directive: '__Directive',
      __DirectiveLocation: '__DirectiveLocation',
      CacheControlScope: 'CacheControlScope',
      Upload: 'Upload',
      Int: 'Int',
    },
    _possibleTypeMap: {},
    _implementations: {},
    _extensionsEnabled: true,
  },
  fragments: {},
  operation: {
    kind: 'OperationDefinition',
    operation: 'query',
    name: {
      kind: 'Name',
      value: 'Example1',
      loc: {
        start: 6,
        end: 14,
      },
    },
    variableDefinitions: [],
    directives: [],
    selectionSet: {
      kind: 'SelectionSet',
      selections: [
        {
          kind: 'Field',
          name: {
            kind: 'Name',
            value: 'Example1',
            loc: {
              start: 19,
              end: 27,
            },
          },
          arguments: [
            {
              kind: 'Argument',
              name: {
                kind: 'Name',
                value: 'where',
                loc: {
                  start: 28,
                  end: 33,
                },
              },
              value: {
                kind: 'ObjectValue',
                fields: [
                  {
                    kind: 'ObjectField',
                    name: {
                      kind: 'Name',
                      value: 'id',
                      loc: {
                        start: 36,
                        end: 38,
                      },
                    },
                    value: {
                      kind: 'StringValue',
                      value: '5caa2b76dde13219cd3b4a0a',
                      block: false,
                      loc: {
                        start: 40,
                        end: 66,
                      },
                    },
                    loc: {
                      start: 36,
                      end: 66,
                    },
                  },
                ],
                loc: {
                  start: 35,
                  end: 67,
                },
              },
              loc: {
                start: 28,
                end: 67,
              },
            },
          ],
          directives: [],
          selectionSet: {
            kind: 'SelectionSet',
            selections: [
              {
                kind: 'Field',
                name: {
                  kind: 'Name',
                  value: 'id',
                  loc: {
                    start: 75,
                    end: 77,
                  },
                },
                arguments: [],
                directives: [],
                loc: {
                  start: 75,
                  end: 77,
                },
              },
              {
                kind: 'Field',
                name: {
                  kind: 'Name',
                  value: 'first',
                  loc: {
                    start: 82,
                    end: 92,
                  },
                },
                arguments: [],
                directives: [],
                loc: {
                  start: 82,
                  end: 92,
                },
              },
              {
                kind: 'Field',
                name: {
                  kind: 'Name',
                  value: 'second',
                  loc: {
                    start: 97,
                    end: 107,
                  },
                },
                arguments: [],
                directives: [],
                loc: {
                  start: 97,
                  end: 107,
                },
              },
              {
                kind: 'Field',
                name: {
                  kind: 'Name',
                  value: 'createdAt',
                  loc: {
                    start: 112,
                    end: 121,
                  },
                },
                arguments: [],
                directives: [],
                loc: {
                  start: 112,
                  end: 121,
                },
              },
            ],
            loc: {
              start: 69,
              end: 125,
            },
          },
          loc: {
            start: 19,
            end: 125,
          },
        },
      ],
      loc: {
        start: 15,
        end: 127,
      },
    },
    loc: {
      start: 0,
      end: 127,
    },
  },
  variableValues: {},
  cacheControl: {
    cacheHint: {
      maxAge: 0,
    },
  },
};
