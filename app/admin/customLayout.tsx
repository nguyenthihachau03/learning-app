import { Layout, AppBar, Menu } from "react-admin";
import { MenuItemLink, useSidebarState } from "react-admin";
import { useLocation } from "react-router-dom";
import {
  BookOutlined, ClassOutlined, TranslateOutlined,
  ListAltOutlined, AssignmentOutlined, QuizOutlined,
  SettingsApplicationsOutlined, ExtensionOutlined, PeopleAltOutlined
} from "@mui/icons-material";

const CustomMenu = () => {
  const location = useLocation();
  const [open] = useSidebarState();

  return (
    <Menu>
      <Menu.DashboardItem />

      <MenuItemLink
        to="/courses"
        primaryText="Khóa học"
        leftIcon={<BookOutlined />}
        sidebarIsOpen={open}
        selected={location.pathname === "/courses"}
      />
      <MenuItemLink
        to="/units"
        primaryText="Bài học"
        leftIcon={<ClassOutlined />}
        sidebarIsOpen={open}
        selected={location.pathname === "/units"}
      />
      <MenuItemLink
        to="/vocabularys"
        primaryText="Bộ từ vựng"
        leftIcon={<TranslateOutlined />}
        sidebarIsOpen={open}
        selected={location.pathname === "/vocabularys"}
      />
      <MenuItemLink
        to="/vocabularyItems"
        primaryText="Từ vựng"
        leftIcon={<ListAltOutlined />}
        sidebarIsOpen={open}
        selected={location.pathname === "/vocabularyItems"}
      />
      <MenuItemLink
        to="/lessons"
        primaryText="Bài giảng"
        leftIcon={<AssignmentOutlined />}
        sidebarIsOpen={open}
        selected={location.pathname === "/lessons"}
      />
      <MenuItemLink
        to="/challenges"
        primaryText="Bài tập"
        leftIcon={<QuizOutlined />}
        sidebarIsOpen={open}
        selected={location.pathname === "/challenges"}
      />
      <MenuItemLink
        to="/challengeOptions"
        primaryText="Đáp án bài tập"
        leftIcon={<SettingsApplicationsOutlined />}
        sidebarIsOpen={open}
        selected={location.pathname === "/challengeOptions"}
      />
      <MenuItemLink
        to="/challengeGames"
        primaryText="Mini game"
        leftIcon={<ExtensionOutlined />}
        sidebarIsOpen={open}
        selected={location.pathname === "/challengeGames"}
      />
      <MenuItemLink
        to="/quiz"
        primaryText="Test Data"
        leftIcon={<PeopleAltOutlined />}
        sidebarIsOpen={open}
        selected={location.pathname === "/quiz"}
      />
    </Menu>
  );
};

const CustomLayout = (props: any) => <Layout {...props} menu={CustomMenu} appBar={AppBar} />;

export default CustomLayout;
