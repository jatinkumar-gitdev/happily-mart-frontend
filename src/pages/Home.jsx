import HomeBanner from "../components/home/HomeBanner";
import MainLayout from "../components/layout/MainLayout";

const Home = () => {
  return (
    <MainLayout>
      {" "}
      <div>
        <HomeBanner />
      </div>
    </MainLayout>
  );
};

export default Home;
