export default {
  fieldName: 'RestaurantsWithRating',
  fieldNodes: [
    {
      kind: 'Field',
      name: {
        kind: 'Name',
        value: 'RestaurantsWithRating',
        loc: {
          start: 4,
          end: 25,
        },
      },
      arguments: [
        {
          kind: 'Argument',
          name: {
            kind: 'Name',
            value: 'where',
            loc: {
              start: 26,
              end: 31,
            },
          },
          value: {
            kind: 'ObjectValue',
            fields: [
              {
                kind: 'ObjectField',
                name: {
                  kind: 'Name',
                  value: 'recommended',
                  loc: {
                    start: 34,
                    end: 45,
                  },
                },
                value: {
                  kind: 'BooleanValue',
                  value: true,
                  loc: {
                    start: 47,
                    end: 51,
                  },
                },
                loc: {
                  start: 34,
                  end: 51,
                },
              },
            ],
            loc: {
              start: 33,
              end: 52,
            },
          },
          loc: {
            start: 26,
            end: 52,
          },
        },
        {
          kind: 'Argument',
          name: {
            kind: 'Name',
            value: 'near',
            loc: {
              start: 54,
              end: 58,
            },
          },
          value: {
            kind: 'ObjectValue',
            fields: [
              {
                kind: 'ObjectField',
                name: {
                  kind: 'Name',
                  value: 'coordinates',
                  loc: {
                    start: 61,
                    end: 72,
                  },
                },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: {
                        kind: 'Name',
                        value: 'lat',
                        loc: {
                          start: 75,
                          end: 78,
                        },
                      },
                      value: {
                        kind: 'FloatValue',
                        value: '50.4282142',
                        loc: {
                          start: 80,
                          end: 90,
                        },
                      },
                      loc: {
                        start: 75,
                        end: 90,
                      },
                    },
                    {
                      kind: 'ObjectField',
                      name: {
                        kind: 'Name',
                        value: 'lng',
                        loc: {
                          start: 92,
                          end: 95,
                        },
                      },
                      value: {
                        kind: 'FloatValue',
                        value: '30.610423400000002',
                        loc: {
                          start: 97,
                          end: 115,
                        },
                      },
                      loc: {
                        start: 92,
                        end: 115,
                      },
                    },
                  ],
                  loc: {
                    start: 74,
                    end: 116,
                  },
                },
                loc: {
                  start: 61,
                  end: 116,
                },
              },
              {
                kind: 'ObjectField',
                name: {
                  kind: 'Name',
                  value: 'geospatialField',
                  loc: {
                    start: 118,
                    end: 133,
                  },
                },
                value: {
                  kind: 'EnumValue',
                  value: 'coordinates',
                  loc: {
                    start: 135,
                    end: 146,
                  },
                },
                loc: {
                  start: 118,
                  end: 146,
                },
              },
              {
                kind: 'ObjectField',
                name: {
                  kind: 'Name',
                  value: 'maxDistance',
                  loc: {
                    start: 148,
                    end: 159,
                  },
                },
                value: {
                  kind: 'IntValue',
                  value: '3000',
                  loc: {
                    start: 161,
                    end: 165,
                  },
                },
                loc: {
                  start: 148,
                  end: 165,
                },
              },
            ],
            loc: {
              start: 60,
              end: 166,
            },
          },
          loc: {
            start: 54,
            end: 166,
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
              value: 'payload',
              loc: {
                start: 174,
                end: 181,
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
                    value: 'ukTitle',
                    loc: {
                      start: 190,
                      end: 197,
                    },
                  },
                  arguments: [],
                  directives: [],
                  loc: {
                    start: 190,
                    end: 197,
                  },
                },
                {
                  kind: 'Field',
                  name: {
                    kind: 'Name',
                    value: 'commentList',
                    loc: {
                      start: 204,
                      end: 215,
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
                          value: 'restaurant',
                          loc: {
                            start: 226,
                            end: 236,
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
                                value: 'ruTitle',
                                loc: {
                                  start: 249,
                                  end: 256,
                                },
                              },
                              arguments: [],
                              directives: [],
                              loc: {
                                start: 249,
                                end: 256,
                              },
                            },
                            {
                              kind: 'Field',
                              name: {
                                kind: 'Name',
                                value: 'commentList',
                                loc: {
                                  start: 267,
                                  end: 278,
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
                                      value: 'restaurant',
                                      loc: {
                                        start: 293,
                                        end: 303,
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
                                            value: 'enTitle',
                                            loc: {
                                              start: 320,
                                              end: 327,
                                            },
                                          },
                                          arguments: [],
                                          directives: [],
                                          loc: {
                                            start: 320,
                                            end: 327,
                                          },
                                        },
                                      ],
                                      loc: {
                                        start: 304,
                                        end: 341,
                                      },
                                    },
                                    loc: {
                                      start: 293,
                                      end: 341,
                                    },
                                  },
                                ],
                                loc: {
                                  start: 279,
                                  end: 353,
                                },
                              },
                              loc: {
                                start: 267,
                                end: 353,
                              },
                            },
                          ],
                          loc: {
                            start: 237,
                            end: 363,
                          },
                        },
                        loc: {
                          start: 226,
                          end: 363,
                        },
                      },
                    ],
                    loc: {
                      start: 216,
                      end: 371,
                    },
                  },
                  loc: {
                    start: 204,
                    end: 371,
                  },
                },
              ],
              loc: {
                start: 182,
                end: 377,
              },
            },
            loc: {
              start: 174,
              end: 377,
            },
          },
          {
            kind: 'Field',
            name: {
              kind: 'Name',
              value: 'rating',
              loc: {
                start: 382,
                end: 388,
              },
            },
            arguments: [],
            directives: [],
            loc: {
              start: 382,
              end: 388,
            },
          },
        ],
        loc: {
          start: 168,
          end: 392,
        },
      },
      loc: {
        start: 4,
        end: 392,
      },
    },
  ],
  returnType: '[RestaurantWithRating!]!',
  parentType: 'Query',
  path: {
    key: 'RestaurantsWithRating',
  },
  schema: {
    __validationErrors: [],
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
                start: 14532,
                end: 14537,
              },
            },
            loc: {
              start: 14532,
              end: 14537,
            },
          },
          loc: {
            start: 14525,
            end: 14537,
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
                start: 14550,
                end: 14558,
              },
            },
            loc: {
              start: 14550,
              end: 14558,
            },
          },
          loc: {
            start: 14540,
            end: 14558,
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
                start: 14575,
                end: 14587,
              },
            },
            loc: {
              start: 14575,
              end: 14587,
            },
          },
          loc: {
            start: 14561,
            end: 14587,
          },
        },
      ],
      loc: {
        start: 14514,
        end: 14589,
      },
    },
    __allowedLegacyNames: [],
    _queryType: 'Query',
    _mutationType: 'Mutation',
    _subscriptionType: 'Subscription',
    _directives: ['@cacheControl', '@skip', '@include', '@deprecated'],
    _typeMap: {
      Query: 'Query',
      String: 'String',
      RestaurantWhereOneInput: 'RestaurantWhereOneInput',
      ID: 'ID',
      Restaurant: 'Restaurant',
      DateTime: 'DateTime',
      Float: 'Float',
      Boolean: 'Boolean',
      CuisinesEnumeration: 'CuisinesEnumeration',
      MenusEnumeration: 'MenusEnumeration',
      restaurantKindsEnumeration: 'restaurantKindsEnumeration',
      restaurantOffersEnumeration: 'restaurantOffersEnumeration',
      restaurantChainsEnumeration: 'restaurantChainsEnumeration',
      restaurantSoursesEnumeration: 'restaurantSoursesEnumeration',
      RestaurantCommentList: 'RestaurantCommentList',
      Comment: 'Comment',
      Int: 'Int',
      WorkDay: 'WorkDay',
      MinMaxInt: 'MinMaxInt',
      Logo: 'Logo',
      Photo: 'Photo',
      GeospatialPoint: 'GeospatialPoint',
      RestaurantWhereInput: 'RestaurantWhereInput',
      RestaurantSortInput: 'RestaurantSortInput',
      RestaurantSortEnum: 'RestaurantSortEnum',
      RestaurantPaginationInput: 'RestaurantPaginationInput',
      RestaurantNearInput: 'RestaurantNearInput',
      RestaurantGeospatialFieldNamesEnum: 'RestaurantGeospatialFieldNamesEnum',
      GeospatialPointInput: 'GeospatialPointInput',
      RestaurantWithRating: 'RestaurantWithRating',
      RestaurantCommentListWhereOneInput: 'RestaurantCommentListWhereOneInput',
      RestaurantCommentListWhereInput: 'RestaurantCommentListWhereInput',
      UserWhereOneInput: 'UserWhereOneInput',
      User: 'User',
      RightsEnumeration: 'RightsEnumeration',
      UserWhereInput: 'UserWhereInput',
      UserSortInput: 'UserSortInput',
      UserSortEnum: 'UserSortEnum',
      Mutation: 'Mutation',
      DemoUser: 'DemoUser',
      RestaurantCreateInput: 'RestaurantCreateInput',
      RestaurantCommentListCreateChildInput: 'RestaurantCommentListCreateChildInput',
      RestaurantCommentListCreateInput: 'RestaurantCommentListCreateInput',
      RestaurantCreateChildInput: 'RestaurantCreateChildInput',
      CommentCreateInput: 'CommentCreateInput',
      WorkDayCreateInput: 'WorkDayCreateInput',
      MinMaxIntCreateInput: 'MinMaxIntCreateInput',
      LogoCreateInput: 'LogoCreateInput',
      PhotoCreateInput: 'PhotoCreateInput',
      Upload: 'Upload',
      ImportOptionsInput: 'ImportOptionsInput',
      ImportFormatEnum: 'ImportFormatEnum',
      PushIntoRestaurantInput: 'PushIntoRestaurantInput',
      RestaurantUpdateInput: 'RestaurantUpdateInput',
      RestaurantCommentListUpdateChildInput: 'RestaurantCommentListUpdateChildInput',
      WorkDayUpdateInput: 'WorkDayUpdateInput',
      MinMaxIntUpdateInput: 'MinMaxIntUpdateInput',
      LogoUpdateInput: 'LogoUpdateInput',
      PhotoUpdateInput: 'PhotoUpdateInput',
      FilesOfRestaurantOptionsInput: 'FilesOfRestaurantOptionsInput',
      RestaurantFileNamesEnum: 'RestaurantFileNamesEnum',
      PushIntoRestaurantCommentListInput: 'PushIntoRestaurantCommentListInput',
      RestaurantCommentListUpdateInput: 'RestaurantCommentListUpdateInput',
      RestaurantUpdateChildInput: 'RestaurantUpdateChildInput',
      CommentUpdateInput: 'CommentUpdateInput',
      UserCreateInput: 'UserCreateInput',
      PushIntoUserInput: 'PushIntoUserInput',
      UserUpdateInput: 'UserUpdateInput',
      Subscription: 'Subscription',
      __Schema: '__Schema',
      __Type: '__Type',
      __TypeKind: '__TypeKind',
      __Field: '__Field',
      __InputValue: '__InputValue',
      __EnumValue: '__EnumValue',
      __Directive: '__Directive',
      __DirectiveLocation: '__DirectiveLocation',
      WeekdaysEnumeration: 'WeekdaysEnumeration',
      RestaurantCreateOrPushChildrenInput: 'RestaurantCreateOrPushChildrenInput',
      RestaurantUpdateChildrenInput: 'RestaurantUpdateChildrenInput',
      RestaurantCommentListCreateOrPushChildrenInput:
        'RestaurantCommentListCreateOrPushChildrenInput',
      RestaurantCommentListUpdateChildrenInput: 'RestaurantCommentListUpdateChildrenInput',
      UserCreateChildInput: 'UserCreateChildInput',
      UserCreateOrPushChildrenInput: 'UserCreateOrPushChildrenInput',
      UserUpdateChildInput: 'UserUpdateChildInput',
      UserUpdateChildrenInput: 'UserUpdateChildrenInput',
      CacheControlScope: 'CacheControlScope',
    },
    _possibleTypeMap: {},
    _implementations: {},
    _extensionsEnabled: true,
  },
  fragments: {},
  operation: {
    kind: 'OperationDefinition',
    operation: 'query',
    variableDefinitions: [],
    directives: [],
    selectionSet: {
      kind: 'SelectionSet',
      selections: [
        {
          kind: 'Field',
          name: {
            kind: 'Name',
            value: 'RestaurantsWithRating',
            loc: {
              start: 4,
              end: 25,
            },
          },
          arguments: [
            {
              kind: 'Argument',
              name: {
                kind: 'Name',
                value: 'where',
                loc: {
                  start: 26,
                  end: 31,
                },
              },
              value: {
                kind: 'ObjectValue',
                fields: [
                  {
                    kind: 'ObjectField',
                    name: {
                      kind: 'Name',
                      value: 'recommended',
                      loc: {
                        start: 34,
                        end: 45,
                      },
                    },
                    value: {
                      kind: 'BooleanValue',
                      value: true,
                      loc: {
                        start: 47,
                        end: 51,
                      },
                    },
                    loc: {
                      start: 34,
                      end: 51,
                    },
                  },
                ],
                loc: {
                  start: 33,
                  end: 52,
                },
              },
              loc: {
                start: 26,
                end: 52,
              },
            },
            {
              kind: 'Argument',
              name: {
                kind: 'Name',
                value: 'near',
                loc: {
                  start: 54,
                  end: 58,
                },
              },
              value: {
                kind: 'ObjectValue',
                fields: [
                  {
                    kind: 'ObjectField',
                    name: {
                      kind: 'Name',
                      value: 'coordinates',
                      loc: {
                        start: 61,
                        end: 72,
                      },
                    },
                    value: {
                      kind: 'ObjectValue',
                      fields: [
                        {
                          kind: 'ObjectField',
                          name: {
                            kind: 'Name',
                            value: 'lat',
                            loc: {
                              start: 75,
                              end: 78,
                            },
                          },
                          value: {
                            kind: 'FloatValue',
                            value: '50.4282142',
                            loc: {
                              start: 80,
                              end: 90,
                            },
                          },
                          loc: {
                            start: 75,
                            end: 90,
                          },
                        },
                        {
                          kind: 'ObjectField',
                          name: {
                            kind: 'Name',
                            value: 'lng',
                            loc: {
                              start: 92,
                              end: 95,
                            },
                          },
                          value: {
                            kind: 'FloatValue',
                            value: '30.610423400000002',
                            loc: {
                              start: 97,
                              end: 115,
                            },
                          },
                          loc: {
                            start: 92,
                            end: 115,
                          },
                        },
                      ],
                      loc: {
                        start: 74,
                        end: 116,
                      },
                    },
                    loc: {
                      start: 61,
                      end: 116,
                    },
                  },
                  {
                    kind: 'ObjectField',
                    name: {
                      kind: 'Name',
                      value: 'geospatialField',
                      loc: {
                        start: 118,
                        end: 133,
                      },
                    },
                    value: {
                      kind: 'EnumValue',
                      value: 'coordinates',
                      loc: {
                        start: 135,
                        end: 146,
                      },
                    },
                    loc: {
                      start: 118,
                      end: 146,
                    },
                  },
                  {
                    kind: 'ObjectField',
                    name: {
                      kind: 'Name',
                      value: 'maxDistance',
                      loc: {
                        start: 148,
                        end: 159,
                      },
                    },
                    value: {
                      kind: 'IntValue',
                      value: '3000',
                      loc: {
                        start: 161,
                        end: 165,
                      },
                    },
                    loc: {
                      start: 148,
                      end: 165,
                    },
                  },
                ],
                loc: {
                  start: 60,
                  end: 166,
                },
              },
              loc: {
                start: 54,
                end: 166,
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
                  value: 'payload',
                  loc: {
                    start: 174,
                    end: 181,
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
                        value: 'ukTitle',
                        loc: {
                          start: 190,
                          end: 197,
                        },
                      },
                      arguments: [],
                      directives: [],
                      loc: {
                        start: 190,
                        end: 197,
                      },
                    },
                    {
                      kind: 'Field',
                      name: {
                        kind: 'Name',
                        value: 'commentList',
                        loc: {
                          start: 204,
                          end: 215,
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
                              value: 'restaurant',
                              loc: {
                                start: 226,
                                end: 236,
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
                                    value: 'ruTitle',
                                    loc: {
                                      start: 249,
                                      end: 256,
                                    },
                                  },
                                  arguments: [],
                                  directives: [],
                                  loc: {
                                    start: 249,
                                    end: 256,
                                  },
                                },
                                {
                                  kind: 'Field',
                                  name: {
                                    kind: 'Name',
                                    value: 'commentList',
                                    loc: {
                                      start: 267,
                                      end: 278,
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
                                          value: 'restaurant',
                                          loc: {
                                            start: 293,
                                            end: 303,
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
                                                value: 'enTitle',
                                                loc: {
                                                  start: 320,
                                                  end: 327,
                                                },
                                              },
                                              arguments: [],
                                              directives: [],
                                              loc: {
                                                start: 320,
                                                end: 327,
                                              },
                                            },
                                          ],
                                          loc: {
                                            start: 304,
                                            end: 341,
                                          },
                                        },
                                        loc: {
                                          start: 293,
                                          end: 341,
                                        },
                                      },
                                    ],
                                    loc: {
                                      start: 279,
                                      end: 353,
                                    },
                                  },
                                  loc: {
                                    start: 267,
                                    end: 353,
                                  },
                                },
                              ],
                              loc: {
                                start: 237,
                                end: 363,
                              },
                            },
                            loc: {
                              start: 226,
                              end: 363,
                            },
                          },
                        ],
                        loc: {
                          start: 216,
                          end: 371,
                        },
                      },
                      loc: {
                        start: 204,
                        end: 371,
                      },
                    },
                  ],
                  loc: {
                    start: 182,
                    end: 377,
                  },
                },
                loc: {
                  start: 174,
                  end: 377,
                },
              },
              {
                kind: 'Field',
                name: {
                  kind: 'Name',
                  value: 'rating',
                  loc: {
                    start: 382,
                    end: 388,
                  },
                },
                arguments: [],
                directives: [],
                loc: {
                  start: 382,
                  end: 388,
                },
              },
            ],
            loc: {
              start: 168,
              end: 392,
            },
          },
          loc: {
            start: 4,
            end: 392,
          },
        },
      ],
      loc: {
        start: 0,
        end: 394,
      },
    },
    loc: {
      start: 0,
      end: 394,
    },
  },
  variableValues: {},
  cacheControl: {
    cacheHint: {
      maxAge: 0,
    },
  },
};
