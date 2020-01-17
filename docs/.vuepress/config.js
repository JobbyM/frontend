module.exports = {
  base: '/frontend/',
  title: '我的前端小册',
  description: '我的前端小册',
  themeConfig: {
    nav: [
      { text: 'HOME', link: '/' },
      { text: '前端', link: '/js/' },
      { text: '计算机通识', link: '/network/' },
      { 
        text: 'GitHub', 
        items: [
          { text: '查看源码', link: 'https://github.com/JobbyM/frontend' },
          { text: '博客', link: 'https://jobbym.github.io/' },
          { text: 'Vue.js 技术揭秘', link: 'https://ustbhuangyi.github.io/vue-analysis/' },
          { text: 'JavaScript 进阶问题列表', link: 'https://github.com/lydiahallie/javascript-questions/blob/master/zh-CN/README-zh_CN.md' },
          { text: '每日*壹题', link: 'https://muyiy.vip/question/'}
        ]
      }
    ],
    displayAllHeaders: false,
    sidebarDepth: 2,
    sidebar: [
      '/',
      {
        title: '前端',
        path: '/js/',
        collapsable: false,
        children: [
          '/js/',
          '/browser/',
          '/performance/',
          '/safety/',
          '/framework/',
          '/Vue/',
          '/React/',
        ]
      },
      {
        title: '计算机通识',
        children: [
          '/network/',
          '/datastruct/',
          '/algorithm/',
        ]
      },
      {
        title: '参考文档',
        children: [
          '/reference/'
        ]
      }
    ],
    lastUpdated: 'Last Updated'
  },
  plugins: {
    '@vuepress/medium-zoom': {
      selector: '.theme-default-content :not(a) > img',
      options: {
        margin: 16
      }
    }
  },
  markdown: {
    lineNumbers: true
  } 
}