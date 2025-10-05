import { useEffect, useState } from "react";
import { Input, AutoComplete, Button, Typography, Row, Col } from "antd";
import StudentItem from "./StudentItem";

function normalize(str: string): string {
  return str
    ?.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .trim();
}

const MAX_RESULT = 5;

interface Student {
  name: string;
  institute: string;
  type: string;
  from_time: number;
  to_time: number;
  date: string;
  remote_url: string;
}

export default function App() {
  const [students, setStudents] = useState<Student[]>([]);
  const [institutes, setInstitutes] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [institute, setInstitute] = useState<string | undefined>();
  const [filteredInstitutes, setFilteredInstitutes] = useState<string[]>([]);
  const [results, setResults] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const handleSearch = () => {
    setError("");
    setLoading(true);

    const cleanName = name.trim();
    const normalizedInput = normalize(cleanName);
    const normalizedInstitute = institute ? normalize(institute) : "";

    let matched: Student[] = [];

    if (!cleanName && !institute) {
      matched = students.sort(() => Math.random() - 0.5).slice(0, MAX_RESULT);
    } else {
      matched = students
        .filter((s) => {
          const matchName = normalize(s.name).includes(normalizedInput);
          const matchInstitute = normalizedInstitute
            ? normalize(s.institute).includes(normalizedInstitute)
            : true;
          return matchName && matchInstitute;
        })
        .slice(0, MAX_RESULT);
    }

    setResults(matched);
    setLoading(false);
    if (matched.length === 0 && (cleanName || institute))
      setError("Không tìm thấy sinh viên phù hợp.");
  };

  useEffect(() => {
    Promise.all([
      fetch("/data/students.json").then((res) => res.json()),
      fetch("/data/institute.json").then((res) => res.json()),
    ])
      .then(([stu, inst]) => {
        setStudents(stu);
        setInstitutes(inst);
        setFilteredInstitutes(inst);
      })
      .catch(() => setError("Không thể tải dữ liệu."));
  }, []);

  useEffect(() => {
    if (students.length > 0) {
      setResults(students.sort(() => Math.random() - 0.5).slice(0, 3));
    }
  }, [students.length]);

  const handleInstituteSearch = (input: string) => {
    if (!input) return setFilteredInstitutes(institutes);
    const normalizedInput = normalize(input);
    setFilteredInstitutes(
      institutes.filter((inst) => normalize(inst).includes(normalizedInput))
    );
  };

  const handleClearInstitute = () => {
    setInstitute(undefined);
    setFilteredInstitutes(institutes);
  };

  // ✅ ép nền trắng cho toàn bộ body + html
  useEffect(() => {
    document.body.style.background = "#fff";
    document.documentElement.style.background = "#fff";
    return () => {
      document.body.style.background = "";
      document.documentElement.style.background = "";
    };
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#fff",
        display: "flex",
        justifyContent: "center",
        padding: "40px 0",
        minWidth: "100vw",
      }}
    >
      <div
        style={{
          width: "90%",
          maxWidth: 1000,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* 🎓 FORM */}
        <div
          style={{
            width: "100%",
            maxWidth: 500,
            marginBottom: 24,
          }}
        >
          <Typography
            style={{
              textAlign: "center",
              fontSize: 22,
              fontWeight: 600,
              marginBottom: 12,
            }}
          >
            🎓 Tốt nghiệp HUST 2025
          </Typography>

          <Input
            placeholder="Nhập tên sinh viên (không dấu)..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            onPressEnter={handleSearch}
            style={{
              fontSize: 16,
              height: 40,
              marginBottom: 10,
            }}
          />

          <AutoComplete
            placeholder="Chọn viện"
            value={institute}
            options={filteredInstitutes.map((inst) => ({ value: inst }))}
            onSearch={handleInstituteSearch}
            onSelect={(val) => setInstitute(val)}
            onClear={handleClearInstitute}
            allowClear
            filterOption={false}
            popupMatchSelectWidth={false}
            dropdownStyle={{ fontSize: 16 }}
            style={{ width: "100%", marginBottom: 10 }}
          >
            <Input
              style={{
                fontSize: 16,
                height: 40,
                width: "100%",
              }}
            />
          </AutoComplete>

          {error && (
            <Typography
              style={{
                color: "red",
                fontSize: 13,
                marginTop: 8,
                textAlign: "end",
              }}
            >
              {error}
            </Typography>
          )}

          <Button
            type="primary"
            onClick={handleSearch}
            loading={loading}
            style={{
              width: "100%",
              fontSize: 16,
              height: 40,
              marginTop: 15,
            }}
          >
            Tìm kiếm
          </Button>

          <Typography
            style={{
              fontSize: 12,
              color: "#333",
              textAlign: "end",
              marginTop: 4,
            }}
          >
            {`Hiển thị tối đa ${MAX_RESULT} kết quả`}
          </Typography>
        </div>

        {/* 📋 DANH SÁCH KẾT QUẢ */}
        {results.length > 0 && (
          <Row>
            {results.map((s) => (
              <StudentItem key={s.name} student={s} />
            ))}
          </Row>
        )}
      </div>
    </div>
  );
}
