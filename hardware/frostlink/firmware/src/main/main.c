#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "driver/twai.h"
#include "esp_log.h"
#include "sdkconfig.h"
#include <inttypes.h>
static const char *TAG = "CAN_SNIFFER";

twai_timing_config_t get_timing_config()
{
#if CONFIG_CAN_BAUD_125K
    return (twai_timing_config_t)TWAI_TIMING_CONFIG_125KBITS();
#elif CONFIG_CAN_BAUD_250K
    return (twai_timing_config_t)TWAI_TIMING_CONFIG_250KBITS();
#elif CONFIG_CAN_BAUD_500K
    return (twai_timing_config_t)TWAI_TIMING_CONFIG_500KBITS();
#elif CONFIG_CAN_BAUD_1000K
    return (twai_timing_config_t)TWAI_TIMING_CONFIG_1MBITS();
#else
#error "No CAN baudrate selected!"
#endif
}
void can_sniffer_task(void *arg)
{
  twai_message_t message;

  while (1)
  {
    if (twai_receive(&message, pdMS_TO_TICKS(100)) == ESP_OK)
    {
      ESP_LOGI(TAG, "ID: 0x%03X DLC: %d Data:", (unsigned int)message.identifier, message.data_length_code);
      for (int i = 0; i < message.data_length_code; i++)
      {
        printf("%02X ", message.data[i]);
      }
      printf("\n");
    }

    vTaskDelay(pdMS_TO_TICKS(10));
  }
}

void app_main(void)
{
  twai_general_config_t g_config = {
      .mode = TWAI_MODE_NORMAL,
      .tx_io = CONFIG_CAN_TX_PIN,
      .rx_io = CONFIG_CAN_RX_PIN,
      .clkout_io = TWAI_IO_UNUSED,
      .bus_off_io = TWAI_IO_UNUSED,
      .tx_queue_len = 5,
      .rx_queue_len = 5,
      .alerts_enabled = TWAI_ALERT_NONE,
      .clkout_divider = 0,
      .intr_flags = ESP_INTR_FLAG_LEVEL1};

  twai_timing_config_t t_config = get_timing_config();
  twai_filter_config_t f_config = TWAI_FILTER_CONFIG_ACCEPT_ALL();

  ESP_ERROR_CHECK(twai_driver_install(&g_config, &t_config, &f_config));
  ESP_ERROR_CHECK(twai_start());

  xTaskCreatePinnedToCore(
      can_sniffer_task,
      "can_sniffer_task",
      4096,
      NULL,
      5,
      NULL,
      1 // CPU1
  );

  ESP_LOGI(TAG, "CAN sniffer started on CPU1");
}
