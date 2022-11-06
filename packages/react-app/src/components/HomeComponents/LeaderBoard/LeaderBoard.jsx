import { SearchOutlined } from "@ant-design/icons";
import { Card, Table, Button, Input, Space } from "antd";
import { useRef, useState } from "react";
import Highlighter from "react-highlight-words";

const LeaderBoard = ({ address }) => {
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

  const dataSource = [
    {
      key: "1",
      name: "Mike",
      age: 32,
      address: address,
      league: "StonePavers",
      games: 7,
      won: 2,
    },
    {
      key: "2",
      name: "John",
      age: 42,
      address: "0xf1a9f2f52a02A89399059b0bC6E371E0CAff3d61",
      league: "♖ Wizards",
      games: 3,
      won: 1,
    },
  ];

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: "20%",
      ...getColumnSearchProps("name"),
    },
    {
      title: "Age",
      dataIndex: "age",
      key: "age",
      width: "10%",
      ...getColumnSearchProps("age"),
      sorter: (a, b) => a.age - b.age,
      ellipsis: true,
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
      width: "30%",
      ...getColumnSearchProps("address"),
    },
    {
      title: "League",
      dataIndex: "league",
      key: "league",
      width: "20%",
      ...getColumnSearchProps("league"),
    },
    {
      title: "Games",
      dataIndex: "games",
      key: "games",
      width: "10%",
      ...getColumnSearchProps("games"),
      sorter: (a, b) => a.games - b.games,
      ellipsis: true,
    },
    {
      title: "Won",
      dataIndex: "won",
      key: "won",
      width: "10%",
      ...getColumnSearchProps("won"),
      sorter: (a, b) => a.won - b.won,
      ellipsis: true,
    },
  ];
  return (
    <>
      <div>
        <h1>LeaderBoard</h1>
      </div>
      <Card>
        <Table dataSource={dataSource} columns={columns} />
      </Card>
    </>
  );
};

export default LeaderBoard;
