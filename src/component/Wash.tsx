import React, { useState, useEffect } from "react";
import "./wash.css";

interface Time {
  id: number;
  remainingTime: number;
  isRunning: boolean;
  model: string;
}

function Wash() {
  const [coinValues, setCoinValues] = useState<{ [key: number]: string }>({});
  const [coinValue, setCoinValue] = useState("");
  const [time, setTime] = useState<{ [key: number]: Time }>({
    1: { id: 1, remainingTime: 300, isRunning: false, model: "LG" },
    2: { id: 2, remainingTime: 300, isRunning: false, model: "LG" },
    3: { id: 3, remainingTime: 300, isRunning: false, model: "Haier" },
    4: { id: 4, remainingTime: 300, isRunning: false, model: "Haier" },
    5: { id: 5, remainingTime: 300, isRunning: false, model: "Samsung" },
    6: { id: 6, remainingTime: 300, isRunning: false, model: "Samsung" },
    7: { id: 7, remainingTime: 300, isRunning: false, model: "Panasonic " },
    8: { id: 8, remainingTime: 300, isRunning: false, model: "Panasonic " },
    9: { id: 9, remainingTime: 300, isRunning: false, model: "SHARP " },
    10: { id: 10, remainingTime: 300, isRunning: false, model: "SHARP" },
    11: { id: 11, remainingTime: 300, isRunning: false, model: "Toshiba" },
    12: { id: 12, remainingTime: 300, isRunning: false, model: "Toshiba" },
  });
  const [isCoinAdded, setIsCoinAdded] = useState<{ [key: number]: boolean }>(
    {}
  );
  const [selectedMachine, setSelectedMachine] = useState<number | null>(null);

  const handleMachineSelect = (id: number) => {
    if (isCoinAdded[id] && time[id].remainingTime > 0) {
      return;
    }

    setSelectedMachine(id);
    setCoinValue(coinValues[id] || "");
  };

  const sendLineNotification = (machineId: number) => {
    const accessToken = "BSM5HEFy97DaN1f5jtwQZ8kYdBNtjmIeBanZxQ8gMQb";
    const message = `เครื่องซักผ้าที่ ${machineId} มีเวลานับถอยหลังน้อยกว่า 1 นาที`;

    fetch("https://notify-api.line.me/api/notify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        to: "https://line.me/ti/p/Bj5BtFhYvO",
        messages: [
          {
            type: "text",
            text: message,
          },
        ],
      }),
    })
      .then(() => {
        console.log("ส่งสัญญาณไลน์สำเร็จ");
      })
      .catch((error) => {
        console.error("เกิดข้อผิดพลาดในการส่งสัญญาณไลน์", error);
      });
  };

  const handleAddCoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (isNaN(Number(coinValue))) {
      return;
    }

    setIsCoinAdded((prevIsCoinAdded) => ({
      ...prevIsCoinAdded,
      [selectedMachine!]: true,
    }));

    setCoinValues((prevCoinValues) => ({
      ...prevCoinValues,
      [selectedMachine!]: coinValue,
    }));

    setCoinValue("");

    if (time[selectedMachine!].remainingTime < 60 && coinValue !== "") {
      sendLineNotification(selectedMachine!);
    }
  };

  const handleCoinValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCoinValue(value);
    setCoinValues((prevCoinValues) => ({
      ...prevCoinValues,
      [selectedMachine!]: value,
    }));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prevTime) => {
        const updatedTime = { ...prevTime };
        Object.keys(updatedTime).forEach((id) => {
          const machineId = Number(id);
          if (
            updatedTime[machineId].remainingTime > 0 &&
            isCoinAdded[machineId]
          ) {
            updatedTime[machineId] = {
              ...updatedTime[machineId],
              remainingTime: updatedTime[machineId].remainingTime - 1,
            };
            if (updatedTime[machineId].remainingTime <= 0) {
              updatedTime[machineId] = {
                ...updatedTime[machineId],
                remainingTime: 0,
                isRunning: false,
              };
            }
          }
        });
        return updatedTime;
      });
    }, 1000); // Run the timer every 1 second (1000 milliseconds)
    return () => clearInterval(interval);
  }, [isCoinAdded]);

  return (
    <div className="wash container-fuild">
      <h1>NEW DAY WASHING</h1>
      <div className="machine-container col-lg-6 col-md-6 col-sm-12">
        <ul className="left-machine col-lg-6 col-md-6 col-sm-12">
          {[1, 2, 3, 4, 5, 6].map((id) => (
            <li key={id}>
              <button
                type="button"
                style={{
                  backgroundColor:
                    isCoinAdded[id] && time[id].remainingTime > 0
                      ? "red"
                      : "green",
                }}
                onClick={() => handleMachineSelect(id)}
              >
                เครื่องซักผ้าที่ {id}
              </button>
              {isCoinAdded[id] && time[id].remainingTime > 0 && (
                <p>
                  เครื่องซักผ้าที่ {id}: เหลือเวลาอีก:{" "}
                  {Math.floor(time[id].remainingTime / 60)}:
                  {time[id].remainingTime % 60} เครื่องซักผ้ารุ่น:{" "}
                  {time[id].model}
                </p>
              )}
              {!isCoinAdded[id] && selectedMachine === id && (
                <form onSubmit={handleAddCoin}>
                  <input
                    type="text"
                    id={id.toString()}
                    placeholder="10,20,30,50,100"
                    pattern="[0-9]*"
                    disabled={selectedMachine !== id || isCoinAdded[id]}
                    value={coinValue}
                    onChange={handleCoinValueChange}
                  />
                  <button
                    disabled={
                      isCoinAdded[id] ||
                      coinValue === "" ||
                      isNaN(Number(coinValue))
                    }
                    type="submit"
                  >
                    เพิ่มเหรียญ
                  </button>
                </form>
              )}
            </li>
          ))}
        </ul>
        <ul className="right-machine col-lg-6 col-md-6 col-sm-12">
          {[7, 8, 9, 10, 11, 12].map((id) => (
            <li key={id}>
              <button
                type="button"
                style={{
                  backgroundColor:
                    isCoinAdded[id] && time[id].remainingTime > 0
                      ? "red"
                      : "green",
                }}
                onClick={() => handleMachineSelect(id)}
              >
                เครื่องซักผ้าที่ {id}
              </button>
              {isCoinAdded[id] && time[id].remainingTime > 0 && (
                <p>
                  เครื่องซักผ้าที่ {id}: นับเวลาถอยหลัง:{" "}
                  {Math.floor(time[id].remainingTime / 60)}:
                  {time[id].remainingTime % 60} เครื่องซักผ้ารุ่น:{" "}
                  {time[id].model}
                </p>
              )}
              {!isCoinAdded[id] && selectedMachine === id && (
                <form onSubmit={handleAddCoin}>
                  <input
                    type="text"
                    id={id.toString()}
                    placeholder="10,20,30,50,100"
                    pattern="[0-9]*"
                    disabled={selectedMachine !== id || isCoinAdded[id]}
                    value={coinValue}
                    onChange={handleCoinValueChange}
                  />
                  <button
                    disabled={
                      isCoinAdded[id] ||
                      coinValue === "" ||
                      isNaN(Number(coinValue))
                    }
                    type="submit"
                  >
                    เพิ่มเหรียญ
                  </button>
                </form>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Wash;
