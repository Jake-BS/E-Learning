const studentSchema = {
    schema: {
        type: "object",
        properties: {
        username: {
            type: "string"
        },
        numberOfTestsDone: {
            type: "integer"
        },
        numberOfContentOpened: {
            type: "integer"
        },
        numberOfAnswersCorrect: {
            type: "integer"
        },
        numberOfQuestionsAnswered: {
            type: "integer"
        },
        contentAccessed: {
            type: "array",
            items: {
            properties: {
                contentId: {
                type: "integer"
                },
                chosenAnswer: {
                type: "string"
                }
            }
            }
        }
        }
    }
}

const teacherSchema = {
  schema: {
    type: "object",
    properties: {
      username: {
        type: "string"
      },
      content: {
        type: "array",
        items: {
          properties: {
            id: {
              type: "integer"
            },
            title: {
              type: "string"
            },
            learningMaterial: {
              type: "string"
            },
            optionalImage: {
              type: "string"
            },
            dateTime: {
              type: "string"
            },
            views: {
              type: "integer"
            },
            question: {
              type: "object",
              properties: {
                numberOfCorrectlyAnswered: {
                  type: "integer"
                },
                numberOfAnswers: {
                  type: "integer"
                },
                text: {
                  type: "string"
                },
                optionalImage: {
                  type: "string"
                },
                answers: {
                  type: "object",
                  properties: {
                    correctAnswer: {
                      type: "string"
                    },
                    incorrectAnswers: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          text: {
                            type: "string"
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

const contentSchema = {
  schema: {
    type: "object",
    properties: {
      id: {
        type: "integer"
      },
      title: {
        type: "string"
      },
      learningMaterial: {
        type: "string"
      },
      optionalImage: {
        type: "string"
      },
      dateTime: {
        type: "string"
      },
      views: {
        type: "integer"
      },
      question: {
        type: "object",
        properties: {
          numberOfCorrectlyAnswered: {
            type: "integer"
          },
          numberOfAnswers: {
            type: "integer"
          },
          text: {
            type: "string"
          },
          optionalImage: {
            type: "string"
          },
          answers: {
            type: "object",
            properties: {
              correctAnswer: {
                type: "string"
              },
              incorrectAnswers: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    text: {
                      type: "string"
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

export {studentSchema, teacherSchema, contentSchema};