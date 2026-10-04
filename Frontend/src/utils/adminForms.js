export const buildTeamFormData = (form) => {
  const formData = new FormData();
  formData.append("teamName", form.teamName);
  formData.append("leaderId", form.leaderId);
  formData.append("competitionId", form.competitionId);

  form.members.forEach((memberId) => formData.append("members", memberId));
  // An omitted members field tells the backend to keep the existing members.
  if (form.members.length === 0) formData.append("members", "");

  if (typeof File !== "undefined" && form.buktiTransfer instanceof File) {
    formData.append("buktiTransfer", form.buktiTransfer);
  }
  return formData;
};
