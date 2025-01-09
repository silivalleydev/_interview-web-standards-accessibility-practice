const { addDecoratorsLegacy, override, addWebpackPlugin } = require('customize-cra');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = override(
    addDecoratorsLegacy(), // 데코레이터 지원 추가
    addWebpackPlugin(
        new BundleAnalyzerPlugin({
            analyzerMode: 'static', // 결과를 HTML 파일로 출력
            openAnalyzer: true,    // 분석 결과를 브라우저에서 자동으로 엽니다.
            reportFilename: 'bundle-report.html', // 결과 파일 이름
        })
    )
);
