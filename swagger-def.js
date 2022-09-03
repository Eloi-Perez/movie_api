module.exports = {
    openapi: '3.0.0',
    info: {
        title: 'movie-api',
        version: '0.1.0',
        description:
            'This is a REST API application made with Express. It serves a movies Database',
        license: {
            name: 'Licensed Under MIT',
            url: 'https://spdx.org/licenses/MIT.html',
        },
        contact: {
            name: 'movie-api',
            url: 'https://github.com/Eloi-Perez/movie_api',
        },
    },
    servers: [
        {
            url: process.env.BASE_URL,
            description: 'Production example server',
        },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT'
            }
        },
        schemas: {
            User: {
                type: 'object',
                required: [
                    'Username',
                    'Password',
                ],
                properties: {
                    Username: {
                        type: 'string',
                        example: 'Joe'
                    },
                    Password: {
                        type: 'string',
                        example: '123456'
                    },

                }
            },
            UpdateUser: {
                allOf: [
                    { $ref: "#/components/schemas/User" },
                    {
                        type: "object",
                        properties: {
                            NewUsername: {
                                type: 'string',
                                example: 'Joe'
                            },
                            NewPassword: {
                                type: 'string',
                                example: '123456'
                            },
                            NewEmail: {
                                type: 'string',
                                example: 'abc@abc.com'
                            },
                            BirthDate: {
                                type: 'string',
                                format: 'date-time',
                                description: 'JavaScript Date Object',
                                example: '2021-01-30T08:30:00Z'
                            },
                        }
                    }
                ]
            },
            CreateUser: {
                allOf: [
                    { $ref: "#/components/schemas/User" },
                    {
                        type: "object",
                        required: [
                            'Email'
                        ],
                        properties: {
                            Email: {
                                type: 'string',
                                example: 'abc@abc.com'
                            },
                            Birthday: {
                                type: 'string',
                                format: 'date-time',
                                description: 'JavaScript Date Object',
                                example: '2021-01-30T08:30:00Z'
                            },
                        }
                    }
                ]
            },
            UserMyMovies: {
                type: 'object',
                properties: {
                    Username: {
                        type: 'string',
                        example: 'Joe'
                    },
                    myMovies: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                _id: {
                                    example: '60720485078f3662d0e67bfa'
                                },
                                Movie: {
                                    type: 'object',
                                    properties: {
                                        _id: {
                                            example: '60720485078f3662d0e67bfa'
                                        },
                                        Title: {
                                            type: 'string',
                                            example: 'Timecrimes'
                                        },
                                        ImagePath: {
                                            type: 'string',
                                            example: '/img/timecrimes'
                                        }
                                    }
                                },
                                score: {
                                    type: 'number',
                                    example: '7'
                                },
                                RelevanceTT: {
                                    type: 'number',
                                    example: '9'
                                },
                                PlanToWatch: {
                                    type: 'boolean',
                                    example: false
                                },
                                Favorite: {
                                    type: 'boolean',
                                    example: true
                                }
                            }
                        }

                    }
                }
            },
            myMovies: {
                type: 'object',
                required: [
                    'Movie'
                ],
                properties: {
                    Movie: {
                        type: 'string',
                        example: 'Timecrimes'
                    },
                    score: {
                        type: 'number',
                        example: '7'
                    },
                    RelevanceTT: {
                        type: 'number',
                        example: '9'
                    },
                    PlanToWatch: {
                        type: 'boolean',
                        example: false
                    },
                    Favorite: {
                        type: 'boolean',
                        example: true
                    }
                }


            },
            Movie: {
                type: 'object',
                properties: {
                    _id: {
                        example: '60720485078f3662d0e67bfa'
                    },
                    Title: {
                        type: 'string',
                        example: 'Timecrimes'
                    },
                    Description: {
                        type: 'string',
                        example: 'A man accidentally gets into a time machine and...'
                    },
                    Genre: {
                        type: 'object',
                        properties: {
                            Name: {
                                type: 'string',
                                example: 'Horror'
                            },
                            Description: {
                                type: 'string',
                                example: 'A horror film is one that seeks to elicit fear in its audience for entertainment purposes.'
                            }
                        }
                    },
                    Director: {
                        type: 'object',
                        properties: {
                            Name: {
                                type: 'string',
                                example: 'Nacho Vigalondo'
                            },
                            Bio: {
                                type: 'string',
                                example: 'Ignacio Vigalondo Palacios, better known as Nacho Vigalondo, is a Spanish filmmaker.'
                            },
                            BirthDate: {
                                type: 'string',
                                format: 'date-time',
                                description: 'JavaScript Date Object',
                                example: '1977-12-17T00:00:00Z'
                            }
                        }
                    },
                    Featured: {
                        type: 'boolean',
                        example: true
                    },
                    ImagePath: {
                        type: 'string',
                        example: '/img/timecrimes'
                    }
                }
            },
            Movies: {
                type: 'array',
                items: {
                    allOf: [
                        { $ref: "#/components/schemas/Movie" }
                    ]
                }
            }
        }
    }
};