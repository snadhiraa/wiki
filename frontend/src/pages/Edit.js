import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";

const Edit = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [updatedContentTitle, setUpdatedContentTitle] = useState("");
  const [updatedContentDescription, setUpdatedContentDescription] = useState("");
  const [updatedInstanceID, setUpdatedInstanceID] = useState("");
  const [updatedContentTag, setUpdatedContentTag] = useState("");
  const [subheadings, setSubheadings] = useState([]);
  const [updatedSubheadings, setUpdatedSubheadings] = useState({});
  const navigate = useNavigate();
  const [instances, setInstances] = useState([]);

  const textareaRefs = useRef({});
  const handleTextareaResize = (textarea) => {
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) setUser(storedUser);

    fetchContent(id);
    fetchInstances();

  }, [id]);

  useEffect(() => {
    Object.values(textareaRefs.current).forEach((textarea) => {
      handleTextareaResize(textarea);
    });
  }, [updatedContentDescription, updatedSubheadings]);

  const fetchInstances = async () => {
    try {
      const response = await fetch("/api/instances");
      if (!response.ok) throw new Error("Failed to fetch instances");
      const data = await response.json();
      setInstances(data);
    } catch (error) {
      console.error(error);
      alert("An error occurred while fetching instances.");
    }
  };

  const fetchContent = async (id) => {
    try {
      const response = await fetch(`http://localhost:3000/api/content/${id}`);
      if (!response.ok) throw new Error("Failed to fetch content");
      const data = await response.json();

      setUpdatedContentTitle(data.content?.title || "");
      setUpdatedContentDescription(data.content.description?.String || "");
      setUpdatedInstanceID(data.content.instance_id || "");
      setUpdatedContentTag(data.content.tag || "")

      const initialSubheadings = {};
      if (data.subheadings && Array.isArray(data.subheadings)) {
        data.subheadings.forEach((sub) => {
          initialSubheadings[sub.id] = {
            subheading: sub.subheading,
            subheading_description: sub.subheading_description,
          };
        });
      }

      setUpdatedSubheadings(initialSubheadings);
      setSubheadings(data.subheadings || []);
    } catch (error) {
      console.error(error);
      alert("An error occurred while fetching content");
    }
  };

  const handleSubheadingChange = (subheadingId, field, value) => {
    setUpdatedSubheadings((prev) => ({
      ...prev,
      [subheadingId]: {
        ...prev[subheadingId],
        [field]: value,
      },
    }));
  };

  const handleDeleteSubheading = async (subheadingId) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this subheading?");

    if (!isConfirmed) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3000/api/subheading/delete/${subheadingId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        alert("Subheading deleted successfully");
        setSubheadings((prev) => prev.filter((sub) => sub.id !== subheadingId));
      } else {
        alert("Failed to delete subheading");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while deleting subheading");
    }
  };

  const handleAddSubheadingClick = async () => {
    navigate(`/addsubheading/${id}`);
  };

  const handleSave = async () => {
    const updatedSubheadingsArray = subheadings.map((subheading) => ({
      id: subheading.id,
      subheading:
        updatedSubheadings[subheading.id]?.subheading || subheading.subheading,
      subheading_description:
        updatedSubheadings[subheading.id]?.subheading_description ||
        subheading.subheading_description,
    }));

    const requestBody = {
      title: updatedContentTitle,
      description: updatedContentDescription,
      instance_id: parseInt(updatedInstanceID, 10),
      tag: updatedContentTag,
      subheadings: updatedSubheadingsArray,
      editor_id: user.id, 
    };

    try {
      const response = await fetch(`http://localhost:3000/api/content/edit/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const historyData = {
          content_id: Number(id),
          editor_id: user.id, 
          edited_at: new Date().toISOString(),
        };

        console.log("History Data:", historyData);

        const historyResponse = await fetch(`http://localhost:3000/api/history/add`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(historyData),
        });

        if (!historyResponse.ok) {
          console.error("Failed to record edit history");
        }

        navigate(`/informasi/${id}`);
      } else {
        alert("Failed to update content");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while saving updates");
    }
  };

  return (
    <div className="container-wrapper">
      <div className="container">
        <div className="text">Edit Content</div>
        <form>
          <div className="form-row">
            <div className="input-data">
              <label>Judul</label>
              <input
                type="text"
                value={updatedContentTitle}
                onChange={(e) => setUpdatedContentTitle(e.target.value)}
                required
              />
            </div>
            <div className="input-data textarea">
              <label>Deskripsi</label>
              <textarea
                ref={(el) => (textareaRefs.current[0] = el || null)}
                rows="2"
                value={updatedContentDescription}
                onChange={(e) => {
                  setUpdatedContentDescription(e.target.value);
                  handleTextareaResize(e.target);
                }}
                required
              ></textarea>
            </div>
            <div className="input-data">
              <label>Instansi</label>
              <select
                value={updatedInstanceID}
                onChange={(e) => setUpdatedInstanceID(e.target.value)}
                required
                disabled={user?.role_id === 3}
              >
                <option value="">Pilih Instansi</option>
                {instances.map((instance) => (
                  <option key={instance.id} value={instance.id}>
                    {instance.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="input-data">
              <label>Tag (Berikan tanda koma sebagai pemisah antar tag, apabila tag lebih dari satu)</label>
              <input
                type="text"
                value={updatedContentTag}
                onChange={(e) => setUpdatedContentTag(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-row">
            {subheadings.map((subheading, index) => (
              <div className="form-row" key={subheading.id}>
                <div className="input-data">
                  <label>Sub Judul</label>
                  <input
                    type="text"
                    value={
                      updatedSubheadings[subheading.id]?.subheading ||
                      subheading.subheading
                    }
                    onChange={(e) =>
                      handleSubheadingChange(subheading.id, "subheading", e.target.value)
                    }
                    required
                  />
                </div>
                <div className="input-data textarea">
                  <label>Deskripsi</label>
                  <textarea
                    ref={(el) => (textareaRefs.current[index + 1] = el || null)}
                    value={
                      updatedSubheadings[subheading.id]?.subheading_description ||
                      subheading.subheading_description
                    }
                    onChange={(e) => {
                      handleSubheadingChange(
                        subheading.id,
                        "subheading_description",
                        e.target.value
                      );
                      handleTextareaResize(e.target);
                    }}
                    required
                  ></textarea>
                </div>
                <div className="submit-btn">
                  <input
                    type="button"
                    value={`Hapus Sub Judul ${subheading.subheading}`}
                    className="btn btn-red"
                    onClick={() => handleDeleteSubheading(subheading.id)}
                  />
                </div>
              </div>
            ))}

          </div>
          <div className="submit-btn">
            <input
              type="button"
              value="Tambah Sub Judul"
              className="btn btn-blue"
              onClick={handleAddSubheadingClick}
            />
            <input
              type="button"
              value="Simpan"
              className="btn btn-green"
              onClick={handleSave}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default Edit;