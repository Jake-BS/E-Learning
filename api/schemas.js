const studentHomeSchema = {
    type: "object",
      properties: {
        username: {
          type: "string"
        },
        contentViewedCount: {
          type: "integer"
        },
        numberOfTestsAttempted: {
          type: "integer"
        },
        averageScore: {
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
              date: {
              type: "string"
              },
              teacherName: {
              type: "string"
              },
              accessed: {
              type: "string"
              }
            },
            required: ["id", "title", "date", "teacherName", "accessed"]
          }
        }
    },
    required: ["username", "contentViewedCount", "numberOfTestsAttempted", "averageScore", "content"]
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

export {studentHomeSchema, teacherSchema, contentSchema};