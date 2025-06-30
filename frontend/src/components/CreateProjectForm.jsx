import { useState } from "react";

const CreateProjectForm = () => {
  const [weddingName, setWeddingName] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [estimatedDays, setEstimatedDays] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [userPin, setUserPin] = useState("");
  const [accessList, setAccessList] = useState([{ email: "", role: "viewer" }]);

  const handleAccessChange = (index, field, value) => {
    const updated = [...accessList];
    updated[index][field] = value;
    setAccessList(updated);
  };

  const addAccessField = () => {
    setAccessList([...accessList, { email: "", role: "viewer" }]);
  };

  const removeAccessField = (index) => {
    const updated = [...accessList];
    updated.splice(index, 1);
    setAccessList(updated);
  };

  const createProject = async () => {
    console.log(`
Wedding Name: ${weddingName}
Due Date: ${dueDate}
Estimated Days: ${estimatedDays}
Mobile Number: ${mobileNumber}
User PIN: ${userPin}
Access List: ${JSON.stringify(accessList, null, 2)}
    `);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-xl rounded-2xl space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Create Wedding Project</h2>

      <input
        className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Wedding Name"
        value={weddingName}
        onChange={(e) => setWeddingName(e.target.value)}
      />

      <input
        type="date"
        className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
      />

      <input
        className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Estimated Days"
        value={estimatedDays}
        onChange={(e) => setEstimatedDays(e.target.value)}
      />

      <input
        className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Mobile Number"
        value={mobileNumber}
        onChange={(e) => setMobileNumber(e.target.value)}
      />

      <input
        className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="User PIN"
        value={userPin}
        onChange={(e) => setUserPin(e.target.value)}
      />

      <div>
        <h4 className="text-lg font-semibold text-gray-700 mb-2">Access Emails</h4>
        {accessList.map((entry, idx) => (
          <div key={idx} className="flex items-center gap-3 mb-2">
            <input
              className="flex-1 border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Email"
              value={entry.email}
              onChange={(e) => handleAccessChange(idx, "email", e.target.value)}
            />
            <select
              className="border rounded-lg p-2"
              value={entry.role}
              onChange={(e) => handleAccessChange(idx, "role", e.target.value)}
            >
              <option value="viewer">Viewer</option>
              <option value="admin">Admin</option>
            </select>
            {idx > 0 && (
              <button
                type="button"
                onClick={() => removeAccessField(idx)}
                className="text-red-500 hover:text-red-700 font-semibold"
              >
                ❌
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addAccessField}
          className="mt-2 text-blue-600 hover:text-blue-800 font-semibold"
        >
          + Add More
        </button>
      </div>

      <button
        onClick={createProject}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
      >
        Create Project
      </button>
    </div>
  );
};

export default CreateProjectForm;
