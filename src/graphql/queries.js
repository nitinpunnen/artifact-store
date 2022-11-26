/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getArtifact = /* GraphQL */ `
  query GetArtifact($id: ID!) {
    getArtifact(id: $id) {
      id
      name
      description
      createdBy
      department
      classification
      fileUrl
      fileName
      createdAt
      updatedAt
    }
  }
`;
export const listArtifacts = /* GraphQL */ `
  query ListArtifacts(
    $filter: ModelArtifactFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listArtifacts(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        description
        createdBy
        department
        classification
        fileUrl
        fileName
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
