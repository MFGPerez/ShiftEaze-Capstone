"use client";
import React, { useState, useEffect } from 'react';
import { parseISO, format, startOfMonth, endOfMonth } from 'date-fns';
import { AiOutlineClose } from 'react-icons/ai';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { firebaseApp } from 'utils/firebase';
import { useWorkers } from './workersContext';

/**
 * ScheduleBlockCreator Component
 * 
 * This component allows the creation of schedule blocks for employees.
 * It fetches employees from Firestore and provides options to create full day, off day, or vacation blocks.
 * 
 * @param {Object} props - The props object
 * @param {Function} props.addBlockToGrid - Function to add a block to the grid
 * @param {Array} props.existingBlocks - Existing schedule blocks
 * @param {Date} props.currentMonth - Current month date object
 * @param {String} props.mode - User mode (admin or worker)
 * @param {String} props.selectedJobTitle - Selected job title for filtering employees
 * @param {Function} props.setSelectedJobTitle - Function to set selected job title
 * @param {Function} props.setBlocks - Function to set blocks state
 * @returns {JSX.Element} The ScheduleBlockCreator component
 */
const ScheduleBlockCreator = ({
  addBlockToGrid,
  existingBlocks,
  currentMonth,
  mode,
  selectedJobTitle,
  setSelectedJobTitle,
  setBlocks
}) => {
  const { setWorkers } = useWorkers();
  const [selectedBlockType, setSelectedBlockType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [error, setError] = useState('');
  const [showDeleteAll, setShowDeleteAll] = useState(true);

  const db = getFirestore(firebaseApp);
  const auth = getAuth(firebaseApp);

  useEffect(() => {
    const firstDayOfMonth = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
    const lastDayOfMonth = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
    setStartDate(firstDayOfMonth);
    setEndDate(lastDayOfMonth);
  }, [currentMonth]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const querySnapshot = await getDocs(collection(db, 'managers', user.uid, 'workers'));
          const employeeList = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            displayName: `${doc.data().firstName} ${doc.data().lastName}`
          }));
          setEmployees(employeeList);
        } else {
          setError('User not authenticated.');
        }
      } catch (error) {
        setError('Failed to fetch employees. Check your permissions.');
        console.error('Error fetching employees:', error);
      }
    };

    onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchEmployees();
      } else {
        setError('User not authenticated.');
      }
    });
  }, [db, auth]);

  useEffect(() => {
    if (selectedJobTitle) {
      const filteredWorkers = employees.filter(worker => worker.position === selectedJobTitle);
      setWorkers(filteredWorkers);
      setFilteredEmployees(filteredWorkers);
    } else {
      setFilteredEmployees([]);
    }
  }, [selectedJobTitle, setWorkers, employees]);

  const handleCheckboxChange = (type) => {
    setSelectedBlockType(type);
    setShowDeleteAll(false);
  };

  const handleDoneClick = () => {
    if (!startDate || !endDate) return;
    if ((selectedBlockType === 'Full Day Block' || selectedBlockType === 'Off Day Block') && (!startTime || !endTime)) return;
    if (!selectedEmployee) return;

    const employee = employees.find(emp => emp.id === selectedEmployee);

    const newBlock = {
      id: `${Date.now()}-${Math.random()}`,
      type: selectedBlockType,
      startDate: parseISO(startDate),
      endDate: parseISO(endDate),
      startTime,
      endTime,
      employee: {
        firstName: employee.firstName,
        lastName: employee.lastName,
        photoURL: employee.photoURL || 'None'
      },
      row: 0,
    };

    addBlockToGrid(newBlock);
    saveBlocksToLocalStorage([...existingBlocks, newBlock]);
    resetForm();
    setShowDeleteAll(true);
  };

  const resetForm = () => {
    setSelectedBlockType('');
    setStartDate('');
    setEndDate('');
    setStartTime('');
    setEndTime('');
    setSelectedEmployee('');
    setShowDeleteAll(true);
  };

  const saveBlocksToLocalStorage = (blocks) => {
    const key = `${selectedJobTitle}-${format(currentMonth, 'yyyy-MM')}`;
    localStorage.setItem(`scheduleBlocks-${key}`, JSON.stringify(blocks));
  };

  const handleDeleteAll = () => {
    setBlocks([]);
    saveBlocksToLocalStorage([]);
  };

  const isValidName = (name) => /^[a-zA-Z\s]+$/.test(name);

  return (
    <div className="relative bg-white p-4">
      <div className="flex items-center space-x-2 p-4 border rounded-lg bg-black opacity-85 mb-4">
        <select
          value={selectedJobTitle}
          onChange={(e) => setSelectedJobTitle(e.target.value)}
          className="hover:bg-blue-700 p-1 rounded-lg bg-blue-500 text-white focus:outline-none border-2 border-transparent hover:border-blue-400"
        >
          <option value="font-comfortaa font-semibold">Select Schedule</option>
          {[...new Set(employees.map(emp => emp.position))].map(jobTitle => (
            <option key={jobTitle} value={jobTitle}>{jobTitle} </option>
          ))}
        </select>
        {mode === 'admin' && (
          <>
            <div className="flex items-center space-x-2 bg-blue-500 px-2 py-1 rounded-lg">
              <div className="w-4 h-4 rounded-full bg-green-500 "></div>
              <input 
                type="checkbox"
                checked={selectedBlockType === 'Full Day Block'}
                onChange={() => handleCheckboxChange('Full Day Block')}
                disabled={mode === 'worker'}
              />
              <span className="text-white font-comfortaa font-semibold">Full Day</span>
            </div>
            <div className="flex items-center space-x-2 bg-blue-500 px-2 py-1 rounded-lg ">
              <div className="w-4 h-4 rounded-full bg-yellow-400"></div>
              <input
                type="checkbox"
                checked={selectedBlockType === 'Off Day Block'}
                onChange={() => handleCheckboxChange('Off Day Block')}
                disabled={mode === 'worker'}
              />
              <span className="text-white font-comfortaa font-semibold">Off Day</span>
            </div>
            <div className="flex items-center space-x-2 bg-blue-500 px-2 py-1 rounded-lg">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <input
                type="checkbox"
                checked={selectedBlockType === 'Vacation Block'}
                onChange={() => handleCheckboxChange('Vacation Block')}
                disabled={mode === 'worker'}
              />
              <span className="text-white font-comfortaa font-semibold">Vacation</span>
            </div>
            {showDeleteAll && (
              <button onClick={handleDeleteAll} className="bg-red-600 text-white px-2 py-1 rounded-lg hover:bg-red-700 border-2 border-transparent hover:border-red-400">
                Delete All
              </button>
            )}
          </>
        )}
        {selectedBlockType && (
          <>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-700 px-2 py-1 rounded-lg focus:outline-none border-2 border-transparent hover:border-blue-400"
              disabled={mode === 'worker'}
            >
              <option value="font-comfortaa font-semibold">Select Worker</option>
              {filteredEmployees
                .filter(emp => isValidName(emp.firstName) && isValidName(emp.lastName))
                .map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName}
                  </option>
                ))}
            </select>
            {selectedBlockType !== 'Vacation Block' && (
              <>
                <input
                  type="time"
                  className="font-comfortaa  flex items-center space-x-2 bg-blue-500 px-2 py-1 rounded-lg"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  disabled={mode === 'worker'}
                  style={{ colorScheme: 'dark' }}
                />
                <input
                  type="time"
                  className="font-comfortaa  flex items-center space-x-2 bg-blue-500 px-2 py-1 rounded-lg"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  disabled={mode === 'worker'}
                  style={{ colorScheme: 'dark' }}
                />
              </>
            )}
            <input
              type="date"
              className="font-comfortaa  flex items-center space-x-2 bg-blue-500 px-2 py-1 rounded-lg text-white"
              value={startDate}
              min={format(startOfMonth(currentMonth), 'yyyy-MM-dd')}
              max={format(endOfMonth(currentMonth), 'yyyy-MM-dd')}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ colorScheme: 'dark' }} // Ensure the text is white in dark mode
              disabled={mode === 'worker'}
            />
            <input
              type="date"
              className="font-comfortaa  flex items-center space-x-2 bg-blue-500 px-2 py-1 rounded-lg text-white"
              value={endDate}
              min={format(startOfMonth(currentMonth), 'yyyy-MM-dd')}
              max={format(endOfMonth(currentMonth), 'yyyy-MM-dd')}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ colorScheme: 'dark' }} // Ensure the text is white in dark mode
              disabled={mode === 'worker'}
            />
            <div className="flex items-center">
              <button onClick={handleDoneClick} className="flex font-comfortaa font-semibold items-center space-x-2 bg-green-600 px-2 py-1 rounded-lg hover:bg-green-700 ml-2 border-2 border-transparent hover:border-green-500" disabled={mode === 'worker'}>
                Done
              </button>
              <button onClick={resetForm} className="font-comfortaa font-semibold text-red-600 hover:text-red-400 ml-8">
                <AiOutlineClose size={24} />
              </button>
            </div>
          </>
        )}
      </div>
      {error && <div className="text-red-500 mt-2">{error}</div>}
    </div>
  );
};

export default ScheduleBlockCreator;
