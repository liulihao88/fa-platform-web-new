<template>
  <div class="sso-exception-page">
    <div class="exception-content">
      <img :src="exceptionImg" alt="SSO登录" class="exception-img" />
      <div class="exception-info">
        <h2 class="exception-title">单点登录</h2>
        <div class="exception-desc">{{ errorMsg }}</div>
        <div class="exception-actions">
          <a-button type="primary" @click="handleBackLogin">返回登录页</a-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { useRoute } from 'vue-router';
  import { useGo } from '/@/hooks/web/usePage';
  import { PageEnum } from '/@/enums/pageEnum';
  import exceptionImg from '/@/assets/svg/net-error.svg';

  const route = useRoute();
  const go = useGo();

  const errorMsg = ref<string>((route.query.errorMsg as string) || '登录验证失败，请联系系统管理员');

  function handleBackLogin() {
    go(PageEnum.BASE_LOGIN);
  }
</script>

<style scoped lang="less">
  .sso-exception-page {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    background-color: #f0f2f5;
    
    .exception-content {
      display: flex;
      align-items: center;
      padding: 40px;
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
      
      .exception-img {
        width: 200px;
        margin-right: 40px;
      }
      
      .exception-info {
        .exception-title {
          margin-bottom: 20px;
          font-size: 24px;
          font-weight: bold;
          color: #333;
        }
        
        .exception-desc {
          margin-bottom: 30px;
          font-size: 16px;
          color: #666;
        }
      }
    }
  }
  
  @media (max-width: 768px) {
    .sso-exception-page {
      .exception-content {
        flex-direction: column;
        
        .exception-img {
          margin-right: 0;
          margin-bottom: 20px;
        }
      }
    }
  }
</style>
