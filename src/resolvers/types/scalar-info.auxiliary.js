export default {
  fieldName: 'friend',
  fieldNodes: [
    {
      kind: 'Field',
      name: {
        kind: 'Name',
        value: 'friend',
        loc: {
          start: 238,
          end: 244,
        },
      },
      arguments: [],
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
                start: 253,
                end: 255,
              },
            },
            arguments: [],
            directives: [],
            loc: {
              start: 253,
              end: 255,
            },
          },
          {
            kind: 'Field',
            name: {
              kind: 'Name',
              value: 'title',
              loc: {
                start: 262,
                end: 267,
              },
            },
            arguments: [],
            directives: [],
            loc: {
              start: 262,
              end: 267,
            },
          },
        ],
        loc: {
          start: 245,
          end: 273,
        },
      },
      loc: {
        start: 238,
        end: 273,
      },
    },
  ],
  returnType: 'Place',
  parentType: 'Place',
  path: {
    prev: {
      key: 'createPlace',
    },
    key: 'friend',
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
      PersonWhereOneInput: 'PersonWhereOneInput',
      ID: 'ID',
      Person: 'Person',
      DateTime: 'DateTime',
      Place: 'Place',
      PlaceWhereOneInput: 'PlaceWhereOneInput',
      Mutation: 'Mutation',
      User: 'User',
      PersonCreateInput: 'PersonCreateInput',
      PersonCreateOrConcatenateChildrenInput: 'PersonCreateOrConcatenateChildrenInput',
      PlaceCreateChildInput: 'PlaceCreateChildInput',
      PlaceCreateInput: 'PlaceCreateInput',
      PlaceCreateOrConcatenateChildrenInput: 'PlaceCreateOrConcatenateChildrenInput',
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
      PersonCreateChildInput: 'PersonCreateChildInput',
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
    operation: 'mutation',
    name: {
      kind: 'Name',
      value: 'createPlace',
      loc: {
        start: 9,
        end: 20,
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
            value: 'createPlace',
            loc: {
              start: 25,
              end: 36,
            },
          },
          arguments: [
            {
              kind: 'Argument',
              name: {
                kind: 'Name',
                value: 'data',
                loc: {
                  start: 37,
                  end: 41,
                },
              },
              value: {
                kind: 'ObjectValue',
                fields: [
                  {
                    kind: 'ObjectField',
                    name: {
                      kind: 'Name',
                      value: 'title',
                      loc: {
                        start: 44,
                        end: 49,
                      },
                    },
                    value: {
                      kind: 'StringValue',
                      value: 'Berlin',
                      block: false,
                      loc: {
                        start: 51,
                        end: 59,
                      },
                    },
                    loc: {
                      start: 44,
                      end: 59,
                    },
                  },
                  {
                    kind: 'ObjectField',
                    name: {
                      kind: 'Name',
                      value: 'friend',
                      loc: {
                        start: 61,
                        end: 67,
                      },
                    },
                    value: {
                      kind: 'ObjectValue',
                      fields: [
                        {
                          kind: 'ObjectField',
                          name: {
                            kind: 'Name',
                            value: 'connect',
                            loc: {
                              start: 70,
                              end: 77,
                            },
                          },
                          value: {
                            kind: 'StringValue',
                            value: '5caf757d62552d713461f420',
                            block: false,
                            loc: {
                              start: 79,
                              end: 105,
                            },
                          },
                          loc: {
                            start: 70,
                            end: 105,
                          },
                        },
                      ],
                      loc: {
                        start: 69,
                        end: 106,
                      },
                    },
                    loc: {
                      start: 61,
                      end: 106,
                    },
                  },
                  {
                    kind: 'ObjectField',
                    name: {
                      kind: 'Name',
                      value: 'friends',
                      loc: {
                        start: 108,
                        end: 115,
                      },
                    },
                    value: {
                      kind: 'ObjectValue',
                      fields: [
                        {
                          kind: 'ObjectField',
                          name: {
                            kind: 'Name',
                            value: 'connect',
                            loc: {
                              start: 118,
                              end: 125,
                            },
                          },
                          value: {
                            kind: 'ListValue',
                            values: [
                              {
                                kind: 'StringValue',
                                value: '5caf757d62552d713461f420',
                                block: false,
                                loc: {
                                  start: 128,
                                  end: 154,
                                },
                              },
                              {
                                kind: 'StringValue',
                                value: '5cb181da9e5df36cc429c9ae',
                                block: false,
                                loc: {
                                  start: 156,
                                  end: 182,
                                },
                              },
                              {
                                kind: 'StringValue',
                                value: '5cb182f42810996e9bb05cd0',
                                block: false,
                                loc: {
                                  start: 184,
                                  end: 210,
                                },
                              },
                            ],
                            loc: {
                              start: 127,
                              end: 211,
                            },
                          },
                          loc: {
                            start: 118,
                            end: 211,
                          },
                        },
                      ],
                      loc: {
                        start: 117,
                        end: 212,
                      },
                    },
                    loc: {
                      start: 108,
                      end: 212,
                    },
                  },
                ],
                loc: {
                  start: 43,
                  end: 213,
                },
              },
              loc: {
                start: 37,
                end: 213,
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
                  value: 'title',
                  loc: {
                    start: 221,
                    end: 226,
                  },
                },
                arguments: [],
                directives: [],
                loc: {
                  start: 221,
                  end: 226,
                },
              },
              {
                kind: 'Field',
                name: {
                  kind: 'Name',
                  value: 'id',
                  loc: {
                    start: 231,
                    end: 233,
                  },
                },
                arguments: [],
                directives: [],
                loc: {
                  start: 231,
                  end: 233,
                },
              },
              {
                kind: 'Field',
                name: {
                  kind: 'Name',
                  value: 'friend',
                  loc: {
                    start: 238,
                    end: 244,
                  },
                },
                arguments: [],
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
                          start: 253,
                          end: 255,
                        },
                      },
                      arguments: [],
                      directives: [],
                      loc: {
                        start: 253,
                        end: 255,
                      },
                    },
                    {
                      kind: 'Field',
                      name: {
                        kind: 'Name',
                        value: 'title',
                        loc: {
                          start: 262,
                          end: 267,
                        },
                      },
                      arguments: [],
                      directives: [],
                      loc: {
                        start: 262,
                        end: 267,
                      },
                    },
                  ],
                  loc: {
                    start: 245,
                    end: 273,
                  },
                },
                loc: {
                  start: 238,
                  end: 273,
                },
              },
              {
                kind: 'Field',
                name: {
                  kind: 'Name',
                  value: 'friends',
                  loc: {
                    start: 278,
                    end: 285,
                  },
                },
                arguments: [],
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
                          start: 294,
                          end: 296,
                        },
                      },
                      arguments: [],
                      directives: [],
                      loc: {
                        start: 294,
                        end: 296,
                      },
                    },
                    {
                      kind: 'Field',
                      name: {
                        kind: 'Name',
                        value: 'title',
                        loc: {
                          start: 303,
                          end: 308,
                        },
                      },
                      arguments: [],
                      directives: [],
                      loc: {
                        start: 303,
                        end: 308,
                      },
                    },
                  ],
                  loc: {
                    start: 286,
                    end: 314,
                  },
                },
                loc: {
                  start: 278,
                  end: 314,
                },
              },
            ],
            loc: {
              start: 215,
              end: 318,
            },
          },
          loc: {
            start: 25,
            end: 318,
          },
        },
      ],
      loc: {
        start: 21,
        end: 320,
      },
    },
    loc: {
      start: 0,
      end: 320,
    },
  },
  variableValues: {},
  cacheControl: {
    cacheHint: {
      maxAge: 0,
    },
  },
};
