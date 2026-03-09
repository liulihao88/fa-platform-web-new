const modules: Record<string, any> = import.meta.glob('./**/*.vue', {
  eager: true,
})
export default {
  async install(app) {
    for (const path in modules) {
      const module = await modules[path]
      const fileReg = /\/(\w*)\.vue/
      const matchFileArr = path.match(fileReg)
      if (matchFileArr) {
        const componentName = matchFileArr[1]
        const finalComponents = module.default || module
        app.component(componentName, finalComponents)
      }
    }
  },
}
