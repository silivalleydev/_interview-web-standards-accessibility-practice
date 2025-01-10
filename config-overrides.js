
const {
    addDecoratorsLegacy,
    override,
    addWebpackPlugin,
    addBabelPlugin,
    addWebpackExternals,
    useBabelRc,
    addWebpackAlias
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
    //   "import",
    //   {
    //     libraryName: "@material-ui/core",
    //     libraryDirectory: "esm", // ES 모듈 경로
    //     camel2DashComponentName: false, // CamelCase 유지
    //   },
    //   "core"
    // ]),

    // addBabelPlugin([
    //     "import",
    //     {
    //       "libraryName": "@mui/metarial",
    //       "libraryDirectory": "esm", // ES 모듈만 가져오기
    //       "camel2DashComponentName": false
    //     },
    //     "core"
    // ]),
  
  );
  