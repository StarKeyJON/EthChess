import React, { useRef, useState } from "react";
import Highlighter from "react-highlight-words";
import { SearchOutlined } from "@ant-design/icons";
import { Card, Table, Button, Input, Space } from "antd";
import { Link } from "react-router-dom";
import { GiTabletopPlayers } from "react-icons/gi";

const LobbyPlayersTable = ({ players }) => {
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = clearFilters => {
    clearFilters();
    setSearchText("");
  };

  const getColumnSearchProps = dataIndex => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div
        style={{
          padding: 8,
        }}
      >
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: "block",
          }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{
              width: 90,
            }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{
              width: 90,
            }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({
                closeDropdown: false,
              });
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
        </Space>
      </div>
    ),
    filterIcon: filtered => (
      <SearchOutlined
        style={{
          color: filtered ? "#1890ff" : undefined,
        }}
      />
    ),
    onFilter: (value, record) => record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: visible => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: text =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{
            backgroundColor: "#ffc069",
            padding: 0,
          }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });

  const columns = [
    {
      title: "Player",
      dataIndex: "name",
      key: "name",
      width: "20%",
      // render: name => <Link to={`/match/room/${name}`}>{name}</Link>,
    },
    {
      title: "Skirmish-Id",
      dataIndex: "skirmishId",
      key: "skirmishId",
      width: "20%",
      render: match => <Link to={`/match/view/${match}`}>{match}</Link>,
    },
    {
      title: "Games-Played",
      dataIndex: "gamesPlayed",
      key: "gamesPlayed",
      width: "10%",
    },
    {
      title: "W/L Ratio",
      dataIndex: "ratio",
      key: "ratio",
      width: "10%",
    },
    {
      title: "Age",
      dataIndex: "age",
      key: "age",
      width: "20%",
    },
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
      width: "20%",
      ...getColumnSearchProps("location"),
    }
  ];
  return (
    <>
      <div>
        <Card>
          <Table
            title={() => (
              <>
                <h3>
                  <GiTabletopPlayers />
                  Active Player Lobby
                </h3>
                <p>View live skirmishes and available players online.</p>
              </>
            )}
            size="small"
            dataSource={players}
            columns={columns}
          />
        </Card>
      </div>
    </>
  );
};

export default LobbyPlayersTable;
