"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import Modal from "./Modal"; // Import the Modal component
import { Operator } from "@/types";

const OperatorForm = () => {
  const [operator, setOperator] = useState({
    firstname: "",
    middlename: "",
    lastname: "",
    license_no: "",
    contact: "",
    region: "",
    city: "",
    brgy: "",
    street: "",
    type: "",
    dl_codes: "",
    conditions: "",
    expiration_date: "",
    emergency_name: "",
    emergency_address: "",
    emergency_contact: "",
    archived: false,
  });

  const [operatorList, setOperatorList] = useState<Operator[]>([]);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 8;
  const totalPages = Math.ceil(operatorList.length / rowsPerPage);
  const [isConfirmArchiveOpen, setIsConfirmArchiveOpen] = useState(false);
  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState(""); // State for alert message
  const [isRegisterAlertVisible, setIsRegisterAlertVisible] = useState(false); // State for register alert visibility
  const [operatorIdToArchive, setOperatorIdToArchive] = useState<number | null>(null);

  useEffect(() => {
    // Check if the current page has rows
    if (!hasRows(currentPage, rowsPerPage, operatorList) && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  }, [currentPage, rowsPerPage, operatorList]);

  // Function to check if the current page has rows
  const hasRows = (currentPage: number, rowsPerPage: number, data: Operator[]) => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return data.slice(startIndex, endIndex).length > 0;
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const currentRows = operatorList.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  useEffect(() => {
    const fetchOperators = async () => {
      try {
        const response = await axios.get("/api/operators");
        setOperatorList(response.data);
      } catch (error) {
        console.error("Failed to fetch operators:", error);
      }
    };

    fetchOperators();
  }, []);

  const handleRegisterModalClose = () => {
    setIsRegisterModalOpen(false);
  };

  const handleViewModalClose = () => {
    setIsViewModalOpen(false);
    setIsEditMode(false);
    setSelectedOperator(null);
  };

  const handleView = (operator: Operator) => {
    setSelectedOperator(operator);
    setIsViewModalOpen(true);
  };

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleArchive = (operator: Operator) => {
    setOperatorIdToArchive(operator.id);
    setIsConfirmArchiveOpen(true);
  };

  const confirmArchiveUser = async () => {
    if (operatorIdToArchive === null) return;

    try {
      // Perform the archive request
      const response = await axios.delete(`/api/operators`, {
        data: { id: operatorIdToArchive } // Include data if needed by your server
      });

      // Check the response status
      if (response.status === 200) {
        showAlert("User archived successfully"); // Show the alert
        setOperatorList((prev) =>
          prev.filter((op) => op.id !== operatorIdToArchive)
        );
        setIsConfirmArchiveOpen(false); // Close the confirmation dialog
      } else {
        console.error('Unexpected response status:', response.status);
        alert('Failed to archive operator');
      }
    } catch (error: any) {
      // Log error details
      console.error('Error during archive:', error.response?.data || error.message);
      alert('Failed to archive operator');
    }
  };

  const handleRegisterChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target;
    setOperator((prevOperator) => ({
      ...prevOperator,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleRegisterSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("/api/operators", operator);
      setAlertMessage("Operator Registered Successfully"); // Set alert message
      setIsRegisterAlertVisible(true); // Show the register alert
      setTimeout(() => setIsRegisterAlertVisible(false), 3000); // Hide the alert after 3 seconds
      setOperator({
        firstname: "",
        middlename: "",
        lastname: "",
        license_no: "",
        contact: "",
        region: "",
        city: "",
        brgy: "",
        street: "",
        type: "",
        dl_codes: "",
        conditions: "",
        expiration_date: "",
        emergency_name: "",
        emergency_address: "",
        emergency_contact: "",
        archived: false,
      });
      const response = await axios.get("/api/operators");
      setOperatorList(response.data);
      handleRegisterModalClose(); // Close the modal after successful submission
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 409) {
          alert("License number already registered");
        } else {
          alert("Failed to register operator");
        }
      }
    }
  };

  const Editdropdown = (e: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSelectedOperator((prevState,) => ({
      ...prevState!,
      [name]: value,
    }));
  };

  const Registerdropdown = (event: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = event.target;
    setOperator((prevOperator) => ({
      ...prevOperator,
      [name]: value,
    }));
  };

  const handleViewChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (selectedOperator) {
      const { name, value } = e.target;
      setSelectedOperator((prev) => ({
        ...prev!,
        [name]: value,
      }));
    }
  };

  const handleViewSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedOperator) return;

    try {
      await axios.put(`/api/operators/${selectedOperator.id}`, selectedOperator);
      showAlert("Operator updated successfully"); // Show the alert
      const response = await axios.get("/api/operators");
      setOperatorList(response.data);
      handleViewModalClose(); // Close the modal after successful update
    } catch (error) {
      showAlert("Failed to update operator"); // Show the alert
    }
  };

  const showAlert = (message: string) => {
    setAlertMessage(message);
    setIsAlertVisible(true);
    setTimeout(() => setIsAlertVisible(false), 3000);
  };

  return (
    <div>
      <button onClick={() => setIsRegisterModalOpen(true)}>Register Operator</button>
      <Modal isOpen={isRegisterModalOpen} onClose={handleRegisterModalClose} title="Modal Title">
        <form onSubmit={handleRegisterSubmit}>
          <label>
            First Name:
            <input type="text" name="firstname" value={operator.firstname} onChange={handleRegisterChange} required />
          </label>
          <br />
          <label>
            Middle Name:
            <input type="text" name="middlename" value={operator.middlename} onChange={handleRegisterChange} />
          </label>
          <br />
          <label>
            Last Name:
            <input type="text" name="lastname" value={operator.lastname} onChange={handleRegisterChange} required />
          </label>
          <br />
          <label>
            License Number:
            <input type="text" name="license_no" value={operator.license_no} onChange={handleRegisterChange} required />
          </label>
          <br />
          <label>
            Contact:
            <input type="tel" name="contact" value={operator.contact} onChange={handleRegisterChange} required />
          </label>
          <br />
          <label>
            Region:
            <input type="text" name="region" value={operator.region} onChange={handleRegisterChange} required />
          </label>
          <br />
          <label>
            City:
            <input type="text" name="city" value={operator.city} onChange={handleRegisterChange} required />
          </label>
          <br />
          <label>
            Barangay:
            <input type="text" name="brgy" value={operator.brgy} onChange={handleRegisterChange} required />
          </label>
          <br />
          <label>
            Street:
            <input type="text" name="street" value={operator.street} onChange={handleRegisterChange} required />
          </label>
          <br />
          <label>
            Type (Driver/Operator):
            <input type="text" name="type" value={operator.type} onChange={handleRegisterChange} required />
          </label>
          <br />
          <label>
            DL Codes:
            <input type="text" name="dl_codes" value={operator.dl_codes} onChange={handleRegisterChange} required />
          </label>
          <br />
          <label>
            Conditions:
            <input type="text" name="conditions" value={operator.conditions} onChange={handleRegisterChange} required />
          </label>
          <br />
          <label>
            Expiration Date:
            <input type="date" name="expiration_date" value={operator.expiration_date} onChange={handleRegisterChange} required />
          </label>
          <br />
          <label>
            Emergency Contact Name:
            <input type="text" name="emergency_name" value={operator.emergency_name} onChange={handleRegisterChange} required />
          </label>
          <br />
          <label>
            Emergency Contact Address:
            <input type="text" name="emergency_address" value={operator.emergency_address} onChange={handleRegisterChange} required />
          </label>
          <br />
          <label>
            Emergency Contact Number:
            <input type="tel" name="emergency_contact" value={operator.emergency_contact} onChange={handleRegisterChange} required />
          </label>
          <br />
          <label>
            Archived:
            <input type="checkbox" name="archived" checked={operator.archived} onChange={handleRegisterChange} />
          </label>
          <br />
          <button type="submit">Register</button>
        </form>
      </Modal>
      {/* Add other components and logic for viewing and editing operators */}
    </div>
  );
};

export default OperatorForm;