
const {
    addDecoratorsLegacy,
    override,
    addWebpackPlugin,
    addBabelPlugin,
    addWebpackExternals,
  } = require('customize-cra');
  const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
  
  module.exports = override(
    // 데코레이터 지원 추가
    addDecoratorsLegacy(),
  
    // Bundle Analyzer 추가
    addWebpackPlugin(
      new BundleAnalyzerPlugin({
        analyzerMode: 'static', // 결과를 HTML 파일로 출력
        openAnalyzer: true,    // 분석 결과를 브라우저에서 자동으로 엽니다.
        reportFilename: 'bundle-report.html', // 결과 파일 이름
      })
    ),
  
    // Babel 플러그인 추가: @material-ui/core의 필요한 모듈만 가져오기
    // addBabelPlugin([
    //     "import",
    //     {
    //       libraryName: "@material-ui/core",
    //       libraryDirectory: "esm", // ES 모듈 경로
    //       camel2DashComponentName: false
    //     },
    //     "material-ui-core"
    //   ]),
    

    // addBabelPlugin([
    //     "import",
    //     {
    //       "libraryName": "@mui/metarial",
    //       "libraryDirectory": "esm", // ES 모듈만 가져오기
    //       "camel2DashComponentName": false
    //     },
    //     "core"
    // ]),
  
    // Webpack 외부 모듈 설정 (CDN 사용)
    addWebpackExternals({
      react: "React", // React를 외부에서 로드
      "react-dom": "ReactDOM",
    }),
    // (config) => {
    //     // 트리 셰이킹 활성화
    //     config.optimization = {
    //       ...config.optimization,
    //       usedExports: true, // 사용되지 않는 코드 제거
    //       sideEffects: true, // package.json의 sideEffects 필드를 활용
    //     };
    
    //     return config;
    //   }
  );
  