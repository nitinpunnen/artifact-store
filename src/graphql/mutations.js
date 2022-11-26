/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createArtifact = /* GraphQL */ `
  mutation CreateArtifact(
    $input: CreateArtifactInput!
    $condition: ModelArtifactConditionInput
  ) {
    createArtifact(input: $input, condition: $condition) {
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
export const updateArtifact = /* GraphQL */ `
  mutation UpdateArtifact(
    $input: UpdateArtifactInput!
    $condition: ModelArtifactConditionInput
  ) {
    updateArtifact(input: $input, condition: $condition) {
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
export const deleteArtifact = /* GraphQL */ `
  mutation DeleteArtifact(
    $input: DeleteArtifactInput!
    $condition: ModelArtifactConditionInput
  ) {
    deleteArtifact(input: $input, condition: $condition) {
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
