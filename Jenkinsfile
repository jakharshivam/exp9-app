pipeline {
  agent any
  environment {
    IMAGE = 'healthcare-api'
    DH = credentials('dockerhub-creds')
  }
  stages {
    stage('Checkout') {
      steps { checkout scm }
    }
    stage('Secret Scan (Gitleaks)') {
      steps {
        sh 'docker run --rm -v $WORKSPACE:/src zricethezav/gitleaks:latest detect --source=/src --no-git --redact --verbose'
      }
    }
    stage('Dependency Scan (npm audit)') {
      steps {
        sh 'docker run --rm -v $WORKSPACE:/app -w /app node:20-alpine npm audit --audit-level=critical'
      }
    }
    stage('SAST (Semgrep)') {
      steps {
        sh 'docker run --rm -v $WORKSPACE:/src semgrep/semgrep semgrep scan --config p/javascript --error /src'
      }
    }
    stage('Build Image') {
      steps {
        sh 'docker build -t $DH_USR/$IMAGE:$BUILD_NUMBER .'
      }
    }
    stage('Image Scan (Trivy)') {
      steps {
        sh 'docker run --rm -v /var/run/docker.sock:/var/run/docker.sock -v trivy-cache:/root/.cache aquasec/trivy:latest image --severity CRITICAL --ignore-unfixed --exit-code 1 $DH_USR/$IMAGE:$BUILD_NUMBER'
      }
    }
    stage('Push Image') {
      steps {
        sh 'echo $DH_PSW | docker login -u $DH_USR --password-stdin'
        sh 'docker push $DH_USR/$IMAGE:$BUILD_NUMBER'
      }
    }
    stage('Deploy (Hardened)') {
      steps {
        sh 'sed "s|IMAGE_PLACEHOLDER|$DH_USR/$IMAGE:$BUILD_NUMBER|" deployment.yaml | kubectl apply -f -'
        sh 'kubectl rollout status deployment/healthcare-api --timeout=120s'
      }
    }
  }
}
