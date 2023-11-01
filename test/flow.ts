import { Builder, until, By } from 'selenium-webdriver';
import { getChromeCapabilities } from '../selenium.config';

const url = process.env.URL || 'http://user@dev-test/staging/app-debug/';
const sessionCount = Number(process.env.SESSIONS_COUNT) || 50;
const sessionsDuration = Number(process.env.SESSIONS_DURATION) || 60;
const buttonClass = 'bg-icon-main-toolbar-logo';
const logInterval = 10; // Лог каждые 10 секунд

async function CheckTabs(driver, duration: number, totalRuntimeSeconds: number) {
  const tabs = await driver.getAllWindowHandles();
  const startTime = new Date().getTime();
  let lastLogTime = startTime;
  try {
    while ((new Date().getTime() - startTime) / 1000 < totalRuntimeSeconds) {
      for (let i = 0; i < tabs.length; i++) {
        await driver.switchTo().window(tabs[i]);
        await driver.wait(until.elementLocated(By.className(buttonClass)), duration);
        await driver.wait(until.elementIsEnabled(await driver.findElement(By.className(buttonClass))), duration);

        if ((new Date().getTime() - lastLogTime) / 1000 >= logInterval) {
          let remainingSeconds = totalRuntimeSeconds - ((new Date().getTime() - startTime) / 1000);
          console.log(`Сессии активны, продолжаю наблюдение. Осталось: ${Math.round(remainingSeconds)} секунд`)
          lastLogTime = new Date().getTime();
        }

        if ((new Date().getTime() - startTime) / 1000 >= totalRuntimeSeconds) {
          console.log(`Время наблюдения вышло, завершаю наблюдение 😊`);
          break;
        }
      }
    }
  } catch (error) {
    console.error('Произошла ошибка при проверке вкладок:', error);
  }
}

it('', async () => {
  const driver = new Builder().withCapabilities(getChromeCapabilities()).build();
  await driver.get(url);

  for (let i = 0; i < sessionCount; i++) {
    driver.executeScript(`window.open("${url}")`);
    try {
      await driver.wait(until.elementLocated(By.className(buttonClass)), 180000);
      await driver.wait(until.elementIsEnabled(await driver.findElement(By.className(buttonClass))), 180000);
      console.log(`Cессия ${i} открыта`);
    } catch (error) {
      console.error('Ошибка при открытии сессии:', error);
    }
  }

  await CheckTabs(driver, 10000, sessionsDuration);
});
